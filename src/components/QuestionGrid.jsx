import { useCallback, useMemo } from 'react'
import { useQuiz } from '../context/QuizContext'

export default function QuestionGrid() {
  const { questions, currentIndex, progressMap, setCurrentIndex } = useQuiz()

  const gridItems = useMemo(() => {
    return questions.map((q, index) => {
      const progress  = progressMap.get(q.id)
      const isCurrent = index === currentIndex
      const answered  = progress?.selectedOption != null
      const bookmarked = progress?.markedForReview

      return { index, id: q.id, answered, isCorrect: progress?.isCorrect, bookmarked, isCurrent }
    })
  }, [questions, currentIndex, progressMap])

  const handleClick = useCallback((index) => setCurrentIndex(index), [setCurrentIndex])

  if (questions.length === 0) return null

  const attempted  = gridItems.filter(i => i.answered).length
  const correct    = gridItems.filter(i => i.isCorrect).length
  const bookmarked = gridItems.filter(i => i.bookmarked).length

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Overview</h3>
        <span className="text-xs text-zinc-600">{attempted}/{questions.length}</span>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-zinc-800/50 rounded-xl p-2 text-center">
          <p className="text-sm font-bold text-emerald-400">{correct}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Correct</p>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-2 text-center">
          <p className="text-sm font-bold text-red-400">{attempted - correct}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Wrong</p>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-2 text-center">
          <p className="text-sm font-bold text-amber-400">{bookmarked}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Saved</p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-h-[40vh] overflow-y-auto pr-3 pb-2 -mr-2 scrollbar-hide">
        <div className="flex flex-wrap gap-1.5 p-1">
          {gridItems.map((item) => {
            let cls = 'bg-zinc-800 text-zinc-500'
            if (item.answered) cls = item.isCorrect ? 'bg-emerald-600/80 text-white' : 'bg-red-600/80 text-white'

            let ring = ''
            if (item.bookmarked) ring += ' ring-1 ring-amber-400'
            if (item.isCurrent)  ring += ' ring-2 ring-indigo-400 scale-110'

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.index)}
                className={`w-8 h-8 rounded-lg text-[11px] font-bold flex items-center justify-center
                            transition-all duration-100 cursor-pointer border-none hover:opacity-80 ${cls}${ring}`}
              >
                {item.index + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-4 pt-3 border-t border-zinc-800">
        {[
          { cls: 'bg-zinc-700', label: 'Untouched' },
          { cls: 'bg-emerald-600/80', label: 'Correct' },
          { cls: 'bg-red-600/80', label: 'Wrong' },
          { cls: 'bg-zinc-700 ring-1 ring-amber-400', label: 'Bookmarked' },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-zinc-600">
            <span className={`w-3 h-3 rounded-sm inline-block ${cls}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
