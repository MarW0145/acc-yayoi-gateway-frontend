import { WORKFLOW_STEPS } from '../constants/mappingFields'
import type { WorkflowStep } from '../types/api'

interface StepIndicatorProps {
  current: WorkflowStep
}

export function StepIndicator({ current }: StepIndicatorProps) {
  const currentIndex = WORKFLOW_STEPS.findIndex((item) => item.id === current)
  return (
    <ol className="flex flex-wrap gap-2">
      {WORKFLOW_STEPS.map((item, index) => {
        const done = index < currentIndex
        const active = item.id === current
        return (
          <li
            key={item.id}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              active
                ? 'bg-slate-900 text-white'
                : done
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-white text-slate-400 ring-1 ring-slate-200'
            }`}
          >
            {index + 1}. {item.label}
          </li>
        )
      })}
    </ol>
  )
}
