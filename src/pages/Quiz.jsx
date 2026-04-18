import { useCallback, useState } from 'react'
import { useQuiz } from '../context/QuizContext'
import { loadFilteredQuestions } from '../services/questionsService'
import useFilter from '../hooks/useFilter'
import FilterPanel from '../components/FilterPanel'
import ProgressBar from '../components/ProgressBar'
import QuestionCard from '../components/QuestionCard'
import QuestionGrid from '../components/QuestionGrid'

export default function Quiz() {
  const {
    questions,
    stats,
    setQuestions,
    setFilters,
    questionsLoading,
    setQuestionsLoading,
  } = useQuiz()

  const filterHook = useFilter()
  const [hasLoaded, setHasLoaded] = useState(false)

  const handleApply = useCallback(async () => {
    const filters = filterHook.currentFilters
    setQuestionsLoading(true)
    setFilters(filters)

    try {
      const result = await loadFilteredQuestions(filters)
      setQuestions(result)
      setHasLoaded(true)
    } catch (err) {
      console.error('Error loading questions:', err)
      setQuestions([])
    } finally {
      setQuestionsLoading(false)
    }
  }, [filterHook.currentFilters, setQuestions, setFilters, setQuestionsLoading])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Filter panel */}
      <FilterPanel
        filterHook={filterHook}
        onApply={handleApply}
        loading={questionsLoading}
      />

      {/* Show content once questions are loaded */}
      {hasLoaded && (
        <>
          {/* Progress bar */}
          <ProgressBar stats={stats} />

          {questions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
              {/* Main question area */}
              <QuestionCard />

              {/* Sidebar: question grid */}
              <div className="order-first lg:order-last">
                <QuestionGrid />
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-400">No questions found for the selected filters.</p>
              <p className="text-sm text-slate-600 mt-2">Try adjusting your filter criteria.</p>
            </div>
          )}
        </>
      )}

      {/* Initial state before loading */}
      {!hasLoaded && !questionsLoading && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <h2 className="text-xl font-semibold text-slate-300 mb-2">Select filters to begin</h2>
          <p className="text-sm text-slate-500">
            Choose an exam group and exam above, then click "Load Questions" to start practicing.
          </p>
        </div>
      )}
    </div>
  )
}
