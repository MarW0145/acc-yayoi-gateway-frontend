import { apiFetch, apiFetchBlob } from './apiClient'
import type {
  ClientMasterResponse,
  FilePreviewResponse,
  FileUploadResponse,
  GeminiModel,
  HealthResponse,
  ImageAnalysisResponse,
  JournalConfirmResponse,
  JournalPreviewResponse,
  MappingConfirmRequest,
  MappingConfirmResponse,
  MappingSuggestResponse,
  SourceType,
  UpdateMasterRequest,
  YayoiExportRequest,
  YayoiExportResponse,
  YayoiJournalCandidate,
} from '../types/api'

const API_BASE = '/api/v1'

export function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/api/health')
}

export function fetchClientMasters(clientId: string): Promise<ClientMasterResponse> {
  return apiFetch<ClientMasterResponse>(`${API_BASE}/masters/${encodeURIComponent(clientId)}`)
}

export function updateClientMasters(
  clientId: string,
  payload: UpdateMasterRequest,
): Promise<ClientMasterResponse> {
  return apiFetch<ClientMasterResponse>(`${API_BASE}/masters/${encodeURIComponent(clientId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function uploadFile(clientId: string, file: File): Promise<FileUploadResponse> {
  const form = new FormData()
  form.append('client_id', clientId)
  form.append('file', file)
  return apiFetch<FileUploadResponse>(`${API_BASE}/files/upload`, {
    method: 'POST',
    body: form,
  })
}

export function fetchPreview(sessionId: string): Promise<FilePreviewResponse> {
  return apiFetch<FilePreviewResponse>(`${API_BASE}/files/${sessionId}/preview`)
}

export function fetchMappingSuggestions(
  sessionId: string,
  sourceType: SourceType = 'bank',
): Promise<MappingSuggestResponse> {
  const params = new URLSearchParams({ source_type: sourceType })
  return apiFetch<MappingSuggestResponse>(
    `${API_BASE}/mapping/${sessionId}/suggestions?${params}`,
  )
}

export function confirmMapping(
  payload: MappingConfirmRequest,
): Promise<MappingConfirmResponse> {
  return apiFetch<MappingConfirmResponse>(`${API_BASE}/mapping/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function previewJournals(sessionId: string): Promise<JournalPreviewResponse> {
  return apiFetch<JournalPreviewResponse>(`${API_BASE}/journals/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  })
}

export function confirmJournals(
  sessionId: string,
  journalCandidates: YayoiJournalCandidate[],
): Promise<JournalConfirmResponse> {
  return apiFetch<JournalConfirmResponse>(`${API_BASE}/journals/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, journal_candidates: journalCandidates }),
  })
}

export function exportYayoi(
  sessionId: string,
  options: Omit<YayoiExportRequest, 'session_id'> = {},
): Promise<YayoiExportResponse> {
  const payload: YayoiExportRequest = { session_id: sessionId, ...options }
  return apiFetch<YayoiExportResponse>(`${API_BASE}/export/yayoi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function downloadExportPackage(downloadUrl: string): Promise<Blob> {
  return apiFetchBlob(downloadUrl)
}

export function analyzeImages(
  files: File[],
  model: GeminiModel = 'gemini-3.5-flash',
): Promise<ImageAnalysisResponse> {
  const form = new FormData()
  for (const file of files) {
    form.append('files', file)
  }
  form.append('model', model)
  return apiFetch<ImageAnalysisResponse>(`${API_BASE}/image/analyze`, {
    method: 'POST',
    body: form,
  })
}
