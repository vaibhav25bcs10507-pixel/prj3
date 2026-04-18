import { useMemo } from 'react'

export default function ProgressBar({ stats }) {
  const { total, attempted, correct, percentage } = stats

  const { barColor, label } = useMemo(() => {
    const displayPct = percentage % 1 === 0 ? percentage : percentage.toFixed(2)

    if (percentage === 0) return { barColor: 'bg-zinc-700', label: '' }
    if (percentage < 30)  return { barColor: 'bg-red-500',    label: `${displayPct}%` }
    if (percentage < 70)  return { barColor: 'bg-amber-500',  label: `${displayPct}%` }
    return                       { barColor: 'bg-emerald-500', label: `${displayPct}%` }
  }, [percentage])

  const unattempted = total - attempted
  const wrong = attempted - correct

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Session Progress</span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-emerald-400 font-medium">{correct} correct</span>
          <span className="text-zinc-700">·</span>
          <span className="text-red-400 font-medium">{wrong} wrong</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-600">{unattempted} left</span>
        </div>
      </div>

      {/* Track */}
      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels below */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-zinc-700">{attempted}/{total} attempted</span>
        {label && <span className={`text-[11px] font-semibold ${
          percentage >= 70 ? 'text-emerald-400' : percentage >= 30 ? 'text-amber-400' : 'text-red-400'
        }`}>{label} accuracy</span>}
      </div>
    </div>
  )
}
