import { AppHeader } from './components/AppHeader'
import { ErrorAlert } from './components/ErrorAlert'
import { StepIndicator } from './components/StepIndicator'
import { ClientStep } from './components/steps/ClientStep'
import { ExportStep } from './components/steps/ExportStep'
import { JournalReviewStep } from './components/steps/JournalReviewStep'
import { MappingStep } from './components/steps/MappingStep'
import { MasterStep } from './components/steps/MasterStep'
import { UploadStep } from './components/steps/UploadStep'
import { useGatewayWorkflow } from './hooks/useGatewayWorkflow'

function App() {
  const workflow = useGatewayWorkflow()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader healthStatus={workflow.healthStatus} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <StepIndicator current={workflow.step} />
        </div>

        <div className="mb-6">
          <ErrorAlert message={workflow.error} onDismiss={workflow.clearError} />
        </div>

        {workflow.sessionId ? (
          <aside className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
            <span className="font-medium text-slate-800">セッション</span>{' '}
            <span className="font-mono">{workflow.sessionId}</span>
            {workflow.originalFilename ? (
              <>
                {' '}
                — <span>{workflow.originalFilename}</span>
              </>
            ) : null}
          </aside>
        ) : null}

        {workflow.step === 'client' ? (
          <ClientStep
            clientId={workflow.clientId}
            sourceType={workflow.sourceType}
            loading={workflow.loading}
            onClientIdChange={workflow.setClientId}
            onSourceTypeChange={workflow.setSourceType}
            onSubmit={workflow.submitClient}
            onOpenMasterSettings={workflow.openMasterSettings}
          />
        ) : null}

        {workflow.step === 'upload' ? (
          <UploadStep
            clientId={workflow.clientId}
            loading={workflow.loading}
            onBack={() => workflow.goToStep('client')}
            onUpload={workflow.submitUpload}
          />
        ) : null}

        {workflow.step === 'mapping' && workflow.preview && workflow.mappingSuggestions ? (
          <MappingStep
            preview={workflow.preview}
            suggestions={workflow.mappingSuggestions.suggestions}
            headerMappings={workflow.headerMappings}
            sourceType={workflow.sourceType}
            loading={workflow.loading}
            onBack={() => workflow.goToStep('upload')}
            onMappingChange={workflow.updateHeaderMapping}
            onSubmit={workflow.submitMapping}
          />
        ) : null}

        {workflow.step === 'journal' ? (
          <JournalReviewStep
            candidates={workflow.journalCandidates}
            accountGroups={workflow.masterAccountGroups}
            taxEntries={workflow.masterTaxEntries}
            duplicateCount={workflow.duplicateCount}
            loading={workflow.loading}
            onBack={() => workflow.goToStep('mapping')}
            onCandidateChange={workflow.updateJournalCandidate}
            onSubmit={workflow.submitJournalConfirm}
          />
        ) : null}

        {workflow.step === 'master' ? (
          <MasterStep
            clientId={workflow.clientId}
            clientAccounts={workflow.masterClientAccounts}
            clientTaxCategories={workflow.masterClientTaxCategories}
            cardBookingMethod={workflow.cardBookingMethod}
            loading={workflow.loading}
            onBack={() => workflow.goToStep('client')}
            onSave={workflow.submitMasterUpdate}
          />
        ) : null}

        {workflow.step === 'export' ? (
          <ExportStep
            sessionId={workflow.sessionId}
            journalsConfirmed={workflow.journalsConfirmed}
            exportableCount={workflow.exportableCount}
            warningCount={workflow.warningCount}
            includeWarning={workflow.includeWarning}
            onIncludeWarningChange={workflow.setIncludeWarning}
            exportResult={workflow.exportResult}
            loading={workflow.loading}
            onBack={() => workflow.goToStep('journal')}
            onExport={workflow.submitExport}
            onRestart={workflow.resetWorkflow}
          />
        ) : null}
      </main>
    </div>
  )
}

export default App
