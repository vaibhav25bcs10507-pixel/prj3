import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuiz } from '../context/QuizContext'
import MathRenderer from './MathRenderer'
import OptionsList from './OptionsList'
import {
  ChevronLeft, ChevronRight,
  Bookmark, BookmarkCheck,
  Send, Eye, EyeOff,
  CheckCircle2, XCircle,
  Hash, Calendar,
} from 'lucide-react'

export default function QuestionCard() {
  const {
    questions, currentIndex, currentQuestion,
    selectedOption, isAnswered, progressMap,
    setCurrentIndex, selectOption, submitAnswer, toggleReviewMark,
  } = useQuiz()

  const [showExplanation, setShowExplanation] = useState(false)

  const questionId = currentQuestion?.id
  useEffect(() => {
    setShowExplanation(false)
  }, [questionId])

  const progress  = currentQuestion ? progressMap.get(currentQuestion.id) : null
  const wasAnswered = isAnswered || (progress?.selectedOption != null)
  const isReviewed  = currentQuestion ? progressMap.get(currentQuestion.id)?.markedForReview || false : false
  const isCorrect   = progress?.isCorrect || (isAnswered && currentQuestion?.correct_options?.includes(selectedOption))

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || !selectedOption) return
    const correct = currentQuestion.correct_options?.includes(selectedOption) ?? false
    submitAnswer(currentQuestion.id, selectedOption, correct)
  }, [currentQuestion, selectedOption, submitAnswer])

  const handlePeek = useCallback(() => {
    if (!currentQuestion) return
    if (!wasAnswered) submitAnswer(currentQuestion.id, null, false)
    setShowExplanation(prev => !prev)
  }, [currentQuestion, wasAnswered, submitAnswer])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }, [currentIndex, setCurrentIndex])

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1)
  }, [currentIndex, questions.length, setCurrentIndex])

  const handleReview = useCallback(() => {
    if (currentQuestion) toggleReviewMark(currentQuestion.id)
  }, [currentQuestion, toggleReviewMark])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (e.key === 'ArrowLeft')  {
        e.preventDefault()
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentIndex, questions.length, setCurrentIndex])

  if (!currentQuestion) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
        <p className="text-zinc-500 text-sm">No question selected.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">

      {/* ── Top bar: counter + nav ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer bg-transparent border-none"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-zinc-600">
            {currentIndex + 1} / {questions.length}
          </span>
          {/* mini progress dots */}
          <div className="hidden sm:flex items-center gap-0.5">
            {questions.slice(Math.max(0, currentIndex - 4), currentIndex + 5).map((q, i) => {
              const absIdx = Math.max(0, currentIndex - 4) + i
              const p = progressMap.get(q.id)
              const isCur = absIdx === currentIndex
              const done = p?.selectedOption != null
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(absIdx)}
                  className={`rounded-full transition-all cursor-pointer border-none
                    ${isCur
                      ? 'w-4 h-2 bg-indigo-500'
                      : done
                        ? `w-2 h-2 ${p.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`
                        : 'w-2 h-2 bg-zinc-700 hover:bg-zinc-600'
                    }`}
                />
              )
            })}
          </div>

          {/* Bookmark */}
          <button
            onClick={handleReview}
            title={isReviewed ? 'Remove bookmark' : 'Bookmark'}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer border-none
              ${isReviewed ? 'bg-amber-500/15 text-amber-400' : 'bg-transparent text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'}`}
          >
            {isReviewed ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === questions.length - 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer bg-transparent border-none"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Question body ── */}
      <div className="p-5 sm:p-6 space-y-5 flex-1">

        {/* Comprehension block */}
        {currentQuestion.comprehension && (
          <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2.5">Comprehension</p>
            <div className="text-sm text-zinc-300">
              <MathRenderer html={currentQuestion.comprehension} />
            </div>
          </div>
        )}

        {/* Direction block */}
        {currentQuestion.direction && (
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">Direction</p>
            <div className="text-sm text-zinc-400">
              <MathRenderer html={currentQuestion.direction} />
            </div>
          </div>
        )}

        {/* Question text */}
        <div className="text-[15px] text-zinc-100 leading-relaxed">
          <MathRenderer html={currentQuestion.content} />
        </div>

        {/* Meta tags */}
        <div className="flex flex-wrap gap-1.5">
          {currentQuestion.topic && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-zinc-800 text-zinc-500 border border-zinc-700/50 px-2 py-0.5 rounded-full">
              <Hash size={9} />
              {currentQuestion.topic.replace(/-/g, ' ')}
            </span>
          )}
          {currentQuestion.year && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-zinc-800 text-zinc-500 border border-zinc-700/50 px-2 py-0.5 rounded-full">
              <Calendar size={9} />
              {currentQuestion.year}
            </span>
          )}
        </div>

        {/* Options */}
        <OptionsList
          options={currentQuestion.options}
          selectedOption={selectedOption}
          onSelect={selectOption}
          isAnswered={wasAnswered}
          correctOptions={currentQuestion.correct_options}
          progressData={progress}
        />

        {/* Result feedback */}
        {wasAnswered && (
          <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium
            ${isCorrect
              ? 'bg-emerald-500/8 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/8 border border-red-500/20 text-red-400'
            }`}
          >
            {isCorrect
              ? <CheckCircle2 size={16} />
              : <XCircle size={16} />}
            {isCorrect
              ? 'Correct!'
              : `Incorrect — correct answer: ${currentQuestion.correct_options?.join(', ') || 'N/A'}`}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/60">
          {!wasAnswered && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-lg shadow-indigo-500/15"
            >
              <Send size={13} />
              Submit
            </button>
          )}

          {(currentQuestion.explanation || currentQuestion.correct_options?.length > 0) && (
            <button
              onClick={handlePeek}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border-none"
            >
              {showExplanation ? <EyeOff size={13} /> : <Eye size={13} />}
              {showExplanation ? 'Hide' : 'Explanation'}
            </button>
          )}
        </div>

        {/* Explanation panel */}
        {showExplanation && currentQuestion.explanation && (
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 sm:p-5">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Explanation</p>
            <div className="text-sm text-zinc-300">
              <MathRenderer html={currentQuestion.explanation} />
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-900/60">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent border-none px-2 py-1 rounded-lg hover:bg-zinc-800"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <span className="text-xs text-zinc-700">Use ← → keys to navigate</span>
        <button
          onClick={goToNext}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent border-none px-2 py-1 rounded-lg hover:bg-zinc-800"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
