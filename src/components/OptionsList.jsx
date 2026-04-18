import { useMemo } from 'react'
import MathRenderer from './MathRenderer'

export default function OptionsList({
  options,
  selectedOption,
  onSelect,
  isAnswered,
  correctOptions,
  progressData, // existing attempt from DB if restoring state
}) {
  // If the question was previously answered, use stored answer
  const effectiveSelected = isAnswered && progressData?.selectedOption != null
    ? progressData.selectedOption
    : selectedOption

  const optionStates = useMemo(() => {
    if (!options) return []
    return options.map((opt) => {
      const isSelected = effectiveSelected === opt.identifier
      const isCorrect = correctOptions?.includes(opt.identifier)

      let stateClass = ''
      if (isAnswered) {
        if (isCorrect) {
          stateClass = 'border-emerald-500 bg-emerald-500/10'
        } else if (isSelected && !isCorrect) {
          stateClass = 'border-red-500 bg-red-500/10'
        } else {
          stateClass = 'border-slate-700 opacity-50'
        }
      } else if (isSelected) {
        stateClass = 'border-indigo-500 bg-indigo-500/10'
      } else {
        stateClass = 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
      }

      return { ...opt, isSelected, isCorrect, stateClass }
    })
  }, [options, effectiveSelected, isAnswered, correctOptions])

  if (!options || options.length === 0) {
    return (
      <div className="text-slate-500 text-sm italic py-4">
        No options available for this question.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {optionStates.map((opt) => (
        <button
          key={opt.identifier}
          onClick={() => !isAnswered && onSelect(opt.identifier)}
          disabled={isAnswered}
          className={`flex items-start gap-3 w-full text-left p-3 sm:p-4 rounded-lg border-2 
                      transition-all duration-200 cursor-pointer disabled:cursor-default bg-transparent
                      ${opt.stateClass}`}
        >
          <span
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${opt.isAnswered && opt.isCorrect
                          ? 'bg-emerald-500 text-white'
                          : opt.isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
          >
            {opt.identifier}
          </span>
          <div className="flex-1 min-w-0 pt-1">
            <MathRenderer html={opt.content} />
          </div>
          {isAnswered && opt.isCorrect && (
            <span className="text-emerald-400 text-xs font-medium mt-1">Correct</span>
          )}
        </button>
      ))}
    </div>
  )
}
