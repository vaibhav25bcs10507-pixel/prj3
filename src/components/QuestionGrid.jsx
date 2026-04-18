import { useCallback, useMemo } from 'react'
import { useQuiz } from '../context/QuizContext'

export default function QuestionGrid() {
  const { questions, currentIndex, progressMap, setCurrentIndex } = useQuiz()

  const gridItems = useMemo(() => {
    return questions.map((q, index) => {
      const progress = progressMap.get(q.id)
      const isCurrent = index === currentIndex

      let statusClass = 'bg-slate-800 text-slate-500' // unattempted

      if (progress) {
        if (progress.selectedOption != null) {
          statusClass = progress.isCorrect
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
        }
        if (progress.markedForReview) {
          statusClass += ' ring-2 ring-amber-400'
        }
      }

      if (isCurrent) {
        statusClass += ' ring-2 ring-indigo-400'
      }

      return { index, statusClass, id: q.id }
    })
  }, [questions, currentIndex, progressMap])

  const handleClick = useCallback(
    (index) => {
      setCurrentIndex(index)
    },
    [setCurrentIndex]
  )

  if (questions.length === 0) return null

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Question Overview</h3>
      <div className="flex flex-wrap gap-1.5">
        {gridItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.index)}
            className={`w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center 
                        transition-all duration-150 cursor-pointer border-none hover:scale-110 ${item.statusClass}`}
          >
            {item.index + 1}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-800 inline-block" />
          Unattempted
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
          Correct
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-600 inline-block" />
          Wrong
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-800 ring-2 ring-amber-400 inline-block" />
          Bookmarked
        </span>
      </div>
    </div>
  )
}
