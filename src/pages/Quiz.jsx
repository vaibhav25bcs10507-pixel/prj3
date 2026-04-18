import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuiz } from '../context/QuizContext'
import { loadFilteredQuestions } from '../services/questionsService'
import ProgressBar from '../components/ProgressBar'
import QuestionCard from '../components/QuestionCard'
import QuestionGrid from '../components/QuestionGrid'
import { ArrowLeft, ChevronRight } from 'lucide-react'

export default function Quiz() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { questions, stats, setQuestions, setFilters, questionsLoading, setQuestionsLoading } = useQuiz()

  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const examGroup = searchParams.get('examGroup')
    const exam      = searchParams.get('exam')
    const subject   = searchParams.get('subject')
    const division  = searchParams.get('division')
    const chapter   = searchParams.get('chapter')

    if (!examGroup || !exam || !subject || !division || !chapter) {
      setError('Please select a valid chapter from the dashboard.')
      return
    }

    const filters = { examGroup, exam, subject, division, chapter }

    const load = async () => {
      setQuestionsLoading(true)
      setFilters(filters)
      setError(null)
      try {
        const result = await loadFilteredQuestions(filters)
        setQuestions(result)
        setHasLoaded(true)
      } catch (err) {
        console.error(err)
        setError('Failed to load questions. Please try again.')
        setQuestions([])
      } finally {
        setQuestionsLoading(false)
      }
    }

    load()
  }, [searchParams, setQuestions, setFilters, setQuestionsLoading])

  const subject  = searchParams.get('subject') || ''
  const division = searchParams.get('division') || ''
  const chapter  = searchParams.get('chapter')  || 'Quiz'
  const topic    = searchParams.get('topic')    || null

  const fmt = (s) => s.replace(/-/g, ' ')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          title="Go Back"
        >
          <ArrowLeft size={15} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-600">
          <span className="capitalize whitespace-nowrap">{fmt(subject)}</span>
          <ChevronRight size={11} />
          <span className="capitalize whitespace-nowrap">{fmt(division)}</span>
          <ChevronRight size={11} />
          <span className={`capitalize whitespace-nowrap ${!topic ? 'text-zinc-300 font-medium' : ''}`}>{fmt(chapter)}</span>
          {topic && (
            <>
              <ChevronRight size={11} />
              <span className="text-zinc-300 font-medium capitalize whitespace-nowrap truncate max-w-[200px]">{fmt(topic)}</span>
            </>
          )}
        </nav>
      </div>

      {/* ── Loading ── */}
      {questionsLoading && (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="w-9 h-9 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-500">Loading questions…</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !questionsLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-xl transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* ── Content ── */}
      {hasLoaded && !error && !questionsLoading && (
        <div className="space-y-4 fade-up">
          <ProgressBar stats={stats} />

          {questions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-4">
              <QuestionCard />
              <div>
                <QuestionGrid />
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
              <p className="text-zinc-500 text-sm">No questions found for this chapter.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-xl transition-colors cursor-pointer"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
