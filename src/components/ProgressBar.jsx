import { useMemo } from 'react'

export default function ProgressBar({ stats }) {
  const { total, attempted, correct, percentage } = stats

  const barColor = useMemo(() => {
    if (percentage === 0) return 'bg-slate-700'
    if (percentage < 30) return 'bg-red-500'
    if (percentage < 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }, [percentage])

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-300">Progress</span>
        <span className="text-xs text-slate-500">
          {attempted}/{total} attempted &middot; {correct} correct
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
