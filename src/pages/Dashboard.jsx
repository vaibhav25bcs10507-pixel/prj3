import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import { getStructure } from '../services/questionsService'
import { BookOpen, ChevronRight, BarChart3, Target, Award } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { progressMap } = useQuiz()
  const [structure, setStructure] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStructure()
      .then(setStructure)
      .finally(() => setLoading(false))
  }, [])

  // Compute per-subject stats
  const subjectStats = useMemo(() => {
    if (!structure) return []
    const stats = []

    for (const [examGroup, exams] of Object.entries(structure)) {
      for (const [exam, subjects] of Object.entries(exams)) {
        for (const [subject, divisions] of Object.entries(subjects)) {
          let totalQuestions = 0
          let attempted = 0
          let correct = 0

          for (const [division, chapters] of Object.entries(divisions)) {
            for (const chapter of chapters) {
              // We don't know exact question count without loading files,
              // but we can count from progressMap
              // This gives us stats only for attempted questions
            }
          }

          // Count from progressMap
          for (const [qid, progress] of progressMap) {
            if (qid.startsWith(`${examGroup}/${exam}/${subject}/`)) {
              totalQuestions++
              if (progress.selectedOption != null) {
                attempted++
                if (progress.isCorrect) correct++
              }
            }
          }

          stats.push({
            examGroup,
            exam,
            subject,
            attempted,
            correct,
            divisionsCount: Object.keys(divisions).length,
            chaptersCount: Object.values(divisions).reduce((sum, chs) => sum + chs.length, 0),
          })
        }
      }
    }

    return stats
  }, [structure, progressMap])

  // Overall stats
  const overallStats = useMemo(() => {
    let attempted = 0
    let correct = 0
    for (const [, p] of progressMap) {
      if (p.selectedOption != null) {
        attempted++
        if (p.isCorrect) correct++
      }
    }
    return { attempted, correct, accuracy: attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : 0 }
  }, [progressMap])

  const displayName = user?.email?.split('@')[0] || 'Student'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Hello, {displayName}
        </h1>
        <p className="text-slate-400 mt-1">Here's your preparation overview</p>
      </div>

      {/* Overall stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <BarChart3 className="text-indigo-400" size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{overallStats.attempted}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Questions Attempted</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Target className="text-emerald-400" size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{overallStats.correct}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Correct Answers</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Award className="text-amber-400" size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{overallStats.accuracy}%</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Accuracy</p>
          </div>
        </div>
      </div>

      {/* Subject cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Subjects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStats.map((s) => (
            <Link
              key={`${s.examGroup}/${s.exam}/${s.subject}`}
              to="/quiz"
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 
                         transition-colors no-underline group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-400" />
                  <h3 className="text-base font-semibold text-white capitalize">{s.subject}</h3>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{s.divisionsCount} divisions</span>
                <span>{s.chaptersCount} chapters</span>
              </div>

              {s.attempted > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{s.attempted} attempted</span>
                    <span className="text-emerald-400">{s.correct} correct</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-600 mt-2 uppercase">
                {s.examGroup} / {s.exam}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick start CTA */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-800/30 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Ready to practice?</h3>
        <p className="text-sm text-slate-400 mb-4">
          Jump into the quiz and start solving questions
        </p>
        <Link
          to="/quiz"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium 
                     px-5 py-2.5 rounded-lg transition-colors no-underline"
        >
          <BookOpen size={16} />
          Start Quiz
        </Link>
      </div>
    </div>
  )
}
