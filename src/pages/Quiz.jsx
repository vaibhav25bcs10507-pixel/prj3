import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuiz } from '../context/QuizContext'
import { loadFilteredQuestions } from '../services/questionsService'
import ProgressBar from '../components/ProgressBar'
import QuestionCard from '../components/QuestionCard'
import QuestionGrid from '../components/QuestionGrid'
import { ArrowLeft } from 'lucide-react'

export default function Quiz() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    questions,
    stats,
    setQuestions,
    setFilters,
    questionsLoading,
    setQuestionsLoading,
  } = useQuiz()

  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const examGroup = searchParams.get('examGroup')
    const exam = searchParams.get('exam')
    const subject = searchParams.get('subject')
    const division = searchParams.get('division')
    const chapter = searchParams.get('chapter')

    if (!examGroup || !exam || !subject || !division || !chapter) {
      setError("Please select a valid chapter from the dashboard.")
      return
    }

    const filters = { examGroup, exam, subject, division, chapter }

    const loadData = async () => {
      setQuestionsLoading(true)
      setFilters(filters)
      setError(null)
      try {
        const result = await loadFilteredQuestions(filters)
        setQuestions(result)
        setHasLoaded(true)
      } catch (err) {
        console.error('Error loading questions:', err)
        setError("Failed to load questions. Please try again.")
        setQuestions([])
      } finally {
        setQuestionsLoading(false)
      }
    }

    loadData()
  }, [searchParams, setQuestions, setFilters, setQuestionsLoading])

  const chapterName = searchParams.get('chapter')?.replace(/-/g, ' ') || 'Quiz'
  const subjectName = searchParams.get('subject')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white capitalize">{chapterName}</h1>
          <p className="text-sm text-slate-400 capitalize">{subjectName}</p>
        </div>
      </div>

      {questionsLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {error && !questionsLoading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Show content once questions are loaded */}
      {hasLoaded && !error && !questionsLoading && (
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
              <p className="text-slate-400">No questions found for this chapter.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
