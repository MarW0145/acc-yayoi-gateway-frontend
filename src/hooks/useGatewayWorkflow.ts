import { useCallback, useEffect, useState } from 'react'
import { REQUIRED_MAPPING_FIELDS } from '../constants/mappingFields'
import {
  confirmJournals,
  confirmMapping,
  exportYayoi,
  fetchClientMasters,
  fetchHealth,
  fetchMappingSuggestions,
  fetchPreview,
  previewJournals,
  uploadFile,
} from '../services/gatewayApi'
import { ApiError } from '../services/apiClient'
import type {
  AccountGroup,
  FilePreviewResponse,
  HeaderMappingSuggestion,
  MappingSuggestResponse,
  SourceType,
  WorkflowStep,
  YayoiExportResponse,
  YayoiJournalCandidate,
} from '../types/api'

function buildMappingsFromSuggestions(suggestions: HeaderMappingSuggestion[]): Record<string, string> {
  const mappings: Record<string, string> = {}
  for (const item of suggestions) {
    if (item.suggested_field) {
      mappings[item.header] = item.suggested_field
    }
  }
  return mappings
}

function missingRequiredFields(mappings: Record<string, string>): string[] {
  const mapped = new Set(Object.values(mappings))
  return REQUIRED_MAPPING_FIELDS.filter((field) => !mapped.has(field))
}

export function useGatewayWorkflow() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null)
  const [step, setStep] = useState<WorkflowStep>('client')
  const [clientId, setClientId] = useState('demo-client')
  const [sourceType, setSourceType] = useState<SourceType>('bank')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [originalFilename, setOriginalFilename] = useState<string | null>(null)
  const [preview, setPreview] = useState<FilePreviewResponse | null>(null)
  const [mappingSuggestions, setMappingSuggestions] = useState<MappingSuggestResponse | null>(null)
  const [headerMappings, setHeaderMappings] = useState<Record<string, string>>({})
  const [journalCandidates, setJournalCandidates] = useState<YayoiJournalCandidate[]>([])
  const [journalsConfirmed, setJournalsConfirmed] = useState(false)
  const [exportResult, setExportResult] = useState<YayoiExportResponse | null>(null)
  const [exportableCount, setExportableCount] = useState(0)
  const [masterAccountGroups, setMasterAccountGroups] = useState<AccountGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealth()
      .then((response) => setHealthStatus(response.status))
      .catch(() => setHealthStatus('offline'))
  }, [])

  useEffect(() => {
    if (step !== 'journal') {
      return
    }
    let cancelled = false
    fetchClientMasters(clientId)
      .then((response) => {
        if (!cancelled) {
          setMasterAccountGroups(response.account_groups)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMasterAccountGroups([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [step, clientId])

  const clearError = useCallback(() => setError(null), [])

  const runAsync = useCallback(async <T,>(task: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      return await task()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '予期しないエラーが発生しました'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const goToStep = useCallback((next: WorkflowStep) => {
    setStep(next)
    setError(null)
  }, [])

  const submitClient = useCallback(() => {
    const trimmed = clientId.trim()
    if (!trimmed) {
      setError('顧客 ID を入力してください')
      return
    }
    setClientId(trimmed)
    goToStep('upload')
  }, [clientId, goToStep])

  const submitUpload = useCallback(
    async (file: File) => {
      const upload = await runAsync(() => uploadFile(clientId, file))
      if (!upload) {
        return
      }
      setSessionId(upload.session_id)
      setOriginalFilename(upload.original_filename)
      setJournalsConfirmed(false)
      setExportResult(null)
      setJournalCandidates([])

      const previewData = await runAsync(() => fetchPreview(upload.session_id))
      if (!previewData) {
        return
      }
      setPreview(previewData)

      const suggestions = await runAsync(() =>
        fetchMappingSuggestions(upload.session_id, sourceType),
      )
      if (!suggestions) {
        return
      }
      setMappingSuggestions(suggestions)
      setHeaderMappings(buildMappingsFromSuggestions(suggestions.suggestions))
      goToStep('mapping')
    },
    [clientId, goToStep, runAsync, sourceType],
  )

  const updateHeaderMapping = useCallback((header: string, field: string) => {
    setHeaderMappings((current) => {
      const next = { ...current }
      if (!field) {
        delete next[header]
      } else {
        next[header] = field
      }
      return next
    })
  }, [])

  const submitMapping = useCallback(async () => {
    if (!sessionId) {
      setError('セッションがありません。先にファイルをアップロードしてください')
      return
    }
    const missing = missingRequiredFields(headerMappings)
    if (missing.length > 0) {
      setError(`必須フィールドが未マッピングです: ${missing.join(', ')}`)
      return
    }

    const confirmed = await runAsync(() =>
      confirmMapping({
        session_id: sessionId,
        source_type: sourceType,
        mappings: headerMappings,
      }),
    )
    if (!confirmed) {
      return
    }

    const journals = await runAsync(() => previewJournals(sessionId))
    if (!journals) {
      return
    }
    setJournalCandidates(journals.journal_candidates)
    setExportableCount(journals.exportable_count)
    setJournalsConfirmed(false)
    goToStep('journal')
  }, [goToStep, headerMappings, runAsync, sessionId, sourceType])

  const updateJournalCandidate = useCallback(
    (transactionId: string, patch: Partial<YayoiJournalCandidate>) => {
      setJournalCandidates((current) =>
        current.map((candidate) =>
          candidate.transaction_id === transactionId
            ? { ...candidate, ...patch }
            : candidate,
        ),
      )
      setJournalsConfirmed(false)
    },
    [],
  )

  const submitJournalConfirm = useCallback(async () => {
    if (!sessionId) {
      setError('セッションがありません')
      return
    }
    const result = await runAsync(() => confirmJournals(sessionId, journalCandidates))
    if (!result) {
      return
    }
    setJournalCandidates(result.journal_candidates)
    setExportableCount(result.exportable_count)
    setJournalsConfirmed(true)
    if (result.exportable_count === 0) {
      setError(
        'エクスポート可能な仕訳（OK）が 0 件です。借方・貸方科目をマスタ登録済みの名称で入力し、' +
          '金額が一致していることを確認してから、再度「仕訳を確定」してください。',
      )
      return
    }
    goToStep('export')
  }, [goToStep, journalCandidates, runAsync, sessionId])

  const submitExport = useCallback(async () => {
    if (!sessionId) {
      setError('セッションがありません')
      return
    }
    if (!journalsConfirmed) {
      setError('仕訳を確定してからエクスポートしてください')
      return
    }
    if (exportableCount === 0) {
      setError(
        'エクスポート可能な仕訳（OK）が 0 件です。仕訳レビューに戻り、科目・金額を修正してください。',
      )
      return
    }
    const result = await runAsync(() => exportYayoi(sessionId))
    if (result) {
      setExportResult(result)
    }
  }, [exportableCount, journalsConfirmed, runAsync, sessionId])

  const resetWorkflow = useCallback(() => {
    setStep('client')
    setSessionId(null)
    setOriginalFilename(null)
    setPreview(null)
    setMappingSuggestions(null)
    setHeaderMappings({})
    setJournalCandidates([])
    setJournalsConfirmed(false)
    setExportResult(null)
    setExportableCount(0)
    setMasterAccountGroups([])
    setError(null)
  }, [])

  return {
    healthStatus,
    step,
    clientId,
    setClientId,
    sourceType,
    setSourceType,
    sessionId,
    originalFilename,
    preview,
    mappingSuggestions,
    headerMappings,
    journalCandidates,
    journalsConfirmed,
    exportResult,
    exportableCount,
    masterAccountGroups,
    loading,
    error,
    clearError,
    goToStep,
    submitClient,
    submitUpload,
    updateHeaderMapping,
    submitMapping,
    updateJournalCandidate,
    submitJournalConfirm,
    submitExport,
    resetWorkflow,
  }
}

export type GatewayWorkflow = ReturnType<typeof useGatewayWorkflow>
