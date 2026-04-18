import { useCallback, useMemo, useState } from 'react'
import { useQuiz } from '../context/QuizContext'
import MathRenderer from './MathRenderer'
import OptionsList from './OptionsList'
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Send, Eye, EyeOff } from 'lucide-react'

export default function QuestionCard() {
  const {
    questions,
    currentIndex,
    currentQuestion,
    selectedOption,
    isAnswered,
    progressMap,
    setCurrentIndex,
    selectOption,
    submitAnswer,
    toggleReviewMark,
  } = useQuiz()

  const [showExplanation, setShowExplanation] = useState(false)

  // Reset explanation visibility when question changes
  const questionId = currentQuestion?.id
  useMemo(() => {
    setShowExplanation(false)
  }, [questionId])

  const progress = currentQuestion ? progressMap.get(currentQuestion.id) : null
  const wasAnswered = isAnswered || (progress?.selectedOption != null)

  const isReviewed = currentQuestion
    ? progressMap.get(currentQuestion.id)?.markedForReview || false
    : false

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || !selectedOption) return

    const isCorrect = currentQuestion.correct_options
      ? currentQuestion.correct_options.includes(selectedOption)
      : false

    submitAnswer(currentQuestion.id, selectedOption, isCorrect)
  }, [currentQuestion, selectedOption, submitAnswer])

  const handlePeek = useCallback(() => {
    if (!currentQuestion) return

    if (!wasAnswered) {
      // Peeking = giving up => record as wrong
      submitAnswer(currentQuestion.id, null, false)
    }

    setShowExplanation((prev) => !prev)
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
  useMemo(() => {
    const handler = (e) => {
      const tag = e.target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [currentIndex, questions.length, setCurrentIndex])

  if (!currentQuestion) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-400">No question selected. Use the filters above to load questions.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header: navigation + counter */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-900 border-b border-slate-800">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent border-none"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium text-slate-300">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <button
          onClick={goToNext}
          disabled={currentIndex === questions.length - 1}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent border-none"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Question body */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* Comprehension */}
        {currentQuestion.comprehension && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-2">Comprehension</p>
            <MathRenderer html={currentQuestion.comprehension} />
          </div>
        )}

        {/* Direction */}
        {currentQuestion.direction && (
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">Direction</p>
            <MathRenderer html={currentQuestion.direction} className="text-sm text-slate-400" />
          </div>
        )}

        {/* Question content */}
        <div className="text-slate-100">
          <MathRenderer html={currentQuestion.content} />
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2">
          {currentQuestion.topic && (
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
              {currentQuestion.topic.replace(/-/g, ' ')}
            </span>
          )}
          {currentQuestion.year && (
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
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
          <div
            className={`rounded-lg p-4 text-sm font-medium ${
              progress?.isCorrect || (isAnswered && currentQuestion.correct_options?.includes(selectedOption))
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {progress?.isCorrect || (isAnswered && currentQuestion.correct_options?.includes(selectedOption))
              ? 'Correct!'
              : `Incorrect. The correct answer is: ${currentQuestion.correct_options?.join(', ') || 'N/A'}`}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          {!wasAnswered && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 
                         disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg 
                         transition-colors cursor-pointer"
            >
              <Send size={14} />
              Submit
            </button>
          )}

          {(currentQuestion.explanation || currentQuestion.correct_options?.length > 0) && (
            <button
              onClick={handlePeek}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 
                         bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors cursor-pointer border-none"
            >
              {showExplanation ? <EyeOff size={14} /> : <Eye size={14} />}
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </button>
          )}

          <button
            onClick={handleReview}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer border-none
                        ${isReviewed
                          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        }`}
          >
            {isReviewed ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            {isReviewed ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        {/* Explanation */}
        {showExplanation && currentQuestion.explanation && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-5">
            <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">Explanation</h4>
            <MathRenderer html={currentQuestion.explanation} className="text-slate-300" />
          </div>
        )}
      </div>
    </div>
  )
}
