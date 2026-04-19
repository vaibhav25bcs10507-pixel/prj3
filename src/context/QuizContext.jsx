import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { fetchUserProgress, recordAttempt, toggleReview, computeStats } from '../services/progressService'

const QuizContext = createContext(null)

const initialState = {
  // Filter state
  filters: {
    examGroup: '',
    exam: '',
    subject: '',
    division: '',
    chapter: '',
    topic: '',
  },
  // Questions
  questions: [],
  currentIndex: 0,
  // Current question interaction
  selectedOption: null,
  isAnswered: false,
  // User progress from DB
  progressMap: new Map(),
  // Loading
  questionsLoading: false,
  progressLoading: true,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload, currentIndex: 0, selectedOption: null, isAnswered: false }
    case 'SET_CURRENT_INDEX': {
      const q = state.questions[action.payload]
      const progress = q ? state.progressMap.get(q.id) : null
      return {
        ...state,
        currentIndex: action.payload,
        selectedOption: null,
        isAnswered: progress?.selectedOption != null,
      }
    }
    case 'SELECT_OPTION':
      return state.isAnswered ? state : { ...state, selectedOption: action.payload }
    case 'SUBMIT_ANSWER':
      return { ...state, isAnswered: true }
    case 'SET_PROGRESS_MAP':
      return { ...state, progressMap: action.payload, progressLoading: false }
    case 'UPDATE_PROGRESS': {
      const newMap = new Map(state.progressMap)
      newMap.set(action.payload.questionId, action.payload.data)
      return { ...state, progressMap: newMap }
    }
    case 'SET_QUESTIONS_LOADING':
      return { ...state, questionsLoading: action.payload }
    default:
      return state
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()

  // Load user progress from Supabase on login
  useEffect(() => {
    dispatch({ type: 'SET_PROGRESS_MAP', payload: new Map() })
  }, [user])

  const setFilters = useCallback((newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters })
  }, [])

  const setQuestions = useCallback((questions) => {
    dispatch({ type: 'SET_QUESTIONS', payload: questions })
  }, [])

  const setCurrentIndex = useCallback((index) => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index })
  }, [])

  const selectOption = useCallback((option) => {
    dispatch({ type: 'SELECT_OPTION', payload: option })
  }, [])

  const submitAnswer = useCallback(async (questionId, selectedOption, isCorrect) => {
    dispatch({ type: 'SUBMIT_ANSWER' })
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: {
        questionId,
        data: {
          selectedOption,
          isCorrect,
          markedForReview: state.progressMap.get(questionId)?.markedForReview || false,
          attemptedAt: new Date().toISOString(),
        },
      },
    })

    // Offline mode: don't record to Supabase
    // if (user) {
    //   await recordAttempt(user.id, questionId, selectedOption, isCorrect)
    // }
  }, [user, state.progressMap])

  const toggleReviewMark = useCallback(async (questionId) => {
    const current = state.progressMap.get(questionId)
    const newMarked = !(current?.markedForReview || false)

    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: {
        questionId,
        data: {
          selectedOption: current?.selectedOption ?? null,
          isCorrect: current?.isCorrect ?? false,
          markedForReview: newMarked,
          attemptedAt: current?.attemptedAt ?? null,
        },
      },
    })

    // Offline mode: don't record to Supabase
    // if (user) {
    //   await toggleReview(user.id, questionId, newMarked)
    // }
  }, [user, state.progressMap])

  const setQuestionsLoading = useCallback((loading) => {
    dispatch({ type: 'SET_QUESTIONS_LOADING', payload: loading })
  }, [])

  const currentQuestion = useMemo(() => {
    return state.questions[state.currentIndex] || null
  }, [state.questions, state.currentIndex])

  const stats = useMemo(() => {
    const ids = state.questions.map((q) => q.id)
    return computeStats(state.progressMap, ids)
  }, [state.progressMap, state.questions])

  const value = {
    ...state,
    currentQuestion,
    stats,
    setFilters,
    setQuestions,
    setCurrentIndex,
    selectOption,
    submitAnswer,
    toggleReviewMark,
    setQuestionsLoading,
  }

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (!context) throw new Error('useQuiz must be used within a QuizProvider')
  return context
}
