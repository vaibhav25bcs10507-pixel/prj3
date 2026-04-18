import { useMemo } from 'react'
import MathRenderer from './MathRenderer'
import { Check } from 'lucide-react'

export default function OptionsList({
  options,
  selectedOption,
  onSelect,
  isAnswered,
  correctOptions,
  progressData,
}) {
  const effectiveSelected = isAnswered && progressData?.selectedOption != null
    ? progressData.selectedOption
    : selectedOption

  const optionStates = useMemo(() => {
    if (!options) return []
    return options.map((opt) => {
      const isSelected = effectiveSelected === opt.identifier
      const isCorrect  = correctOptions?.includes(opt.identifier)

      let containerClass = ''
      let badgeClass = ''

      if (isAnswered) {
        if (isCorrect) {
          containerClass = 'border-emerald-500/60 bg-emerald-500/6'
          badgeClass     = 'bg-emerald-500 text-white'
        } else if (isSelected && !isCorrect) {
          containerClass = 'border-red-500/50 bg-red-500/6'
          badgeClass     = 'bg-red-500 text-white'
        } else {
          containerClass = 'border-zinc-800 opacity-40'
          badgeClass     = 'bg-zinc-800 text-zinc-500'
        }
      } else if (isSelected) {
        containerClass = 'border-indigo-500/70 bg-indigo-500/8'
        badgeClass     = 'bg-indigo-500 text-white'
      } else {
        containerClass = 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/40'
        badgeClass     = 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300'
      }

      return { ...opt, isSelected, isCorrect, containerClass, badgeClass }
    })
  }, [options, effectiveSelected, isAnswered, correctOptions])

  if (!options || options.length === 0) {
    return <p className="text-zinc-600 text-sm italic py-4">No options available.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {optionStates.map((opt) => (
        <button
          key={opt.identifier}
          onClick={() => !isAnswered && onSelect(opt.identifier)}
          disabled={isAnswered}
          className={`group flex items-start gap-3 w-full text-left px-4 py-3.5 rounded-xl border-2 
                      transition-all duration-150 cursor-pointer disabled:cursor-default bg-transparent
                      ${opt.containerClass}`}
        >
          {/* Letter badge */}
          <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${opt.badgeClass}`}>
            {isAnswered && opt.isCorrect ? <Check size={13} /> : opt.identifier}
          </span>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5 text-sm">
            <MathRenderer html={opt.content} />
          </div>

          {/* Correct label */}
          {isAnswered && opt.isCorrect && (
            <span className="flex-shrink-0 text-[11px] font-semibold text-emerald-400 mt-0.5 self-center">
              Correct
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
