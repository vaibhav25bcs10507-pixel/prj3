import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import { getStructure } from '../services/questionsService'
import { BookOpen, ChevronRight, ChevronDown, BarChart3, Target, Award, Folder, FileText } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { progressMap } = useQuiz()
  const navigate = useNavigate()
  const [structure, setStructure] = useState(null)
  const [loading, setLoading] = useState(true)

  // Accordion state
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [expandedDivision, setExpandedDivision] = useState(null)

  useEffect(() => {
    getStructure()
      .then(setStructure)
      .finally(() => setLoading(false))
  }, [])

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

  // Assuming structure is mostly 1 examGroup and 1 exam for now (e.g. jee / jee-main)
  // We'll just grab the first one to display the hierarchy nicely
  const examGroup = structure ? Object.keys(structure)[0] : null
  const exam = examGroup ? Object.keys(structure[examGroup])[0] : null
  const subjects = exam ? structure[examGroup][exam] : {}

  const toggleSubject = (subj) => {
    setExpandedSubject(expandedSubject === subj ? null : subj)
    setExpandedDivision(null) // Reset division when changing subject
  }

  const toggleDivision = (div) => {
    setExpandedDivision(expandedDivision === div ? null : div)
  }

  const startQuiz = (subject, division, chapter) => {
    const params = new URLSearchParams({
      examGroup,
      exam,
      subject,
      division,
      chapter
    })
    navigate(`/quiz?${params.toString()}`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome back, {displayName}
        </h1>
        <p className="text-slate-400 mt-1">Select a chapter to start practicing or review your progress.</p>
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

      {/* Syllabus Explorer */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-indigo-400" />
          Course Syllabus ({examGroup?.toUpperCase()} - {exam?.toUpperCase()})
        </h2>
        
        <div className="space-y-3">
          {Object.entries(subjects).map(([subject, divisions]) => (
            <div key={subject} className="border border-slate-800 bg-slate-900/30 rounded-xl overflow-hidden">
              {/* Subject Header */}
              <button
                onClick={() => toggleSubject(subject)}
                className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${expandedSubject === subject ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Folder size={20} />
                  </div>
                  <h3 className="text-lg font-medium text-white capitalize">{subject}</h3>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                    {Object.keys(divisions).length} divisions
                  </span>
                </div>
                {expandedSubject === subject ? (
                  <ChevronDown size={20} className="text-slate-400" />
                ) : (
                  <ChevronRight size={20} className="text-slate-400" />
                )}
              </button>

              {/* Divisions (Expanded) */}
              {expandedSubject === subject && (
                <div className="border-t border-slate-800 p-2 space-y-2">
                  {Object.entries(divisions).map(([division, chapters]) => (
                    <div key={division} className="rounded-lg overflow-hidden border border-slate-800/50">
                      {/* Division Header */}
                      <button
                        onClick={() => toggleDivision(division)}
                        className="w-full flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 ml-2">
                          <Folder size={16} className={expandedDivision === division ? 'text-indigo-400' : 'text-slate-500'} />
                          <span className="text-sm font-medium text-slate-200 capitalize">{division.replace(/-/g, ' ')}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            ({chapters.length} chapters)
                          </span>
                        </div>
                        {expandedDivision === division ? (
                          <ChevronDown size={16} className="text-slate-500" />
                        ) : (
                          <ChevronRight size={16} className="text-slate-500" />
                        )}
                      </button>

                      {/* Chapters (Expanded) */}
                      {expandedDivision === division && (
                        <div className="p-2 space-y-1 bg-slate-950/50">
                          {chapters.map((chapter) => (
                            <button
                              key={chapter}
                              onClick={() => startQuiz(subject, division, chapter)}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-indigo-500/10 group transition-colors text-left"
                            >
                              <div className="flex items-center gap-3 ml-6">
                                <FileText size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                <span className="text-sm text-slate-300 group-hover:text-white capitalize">
                                  {chapter.replace(/-/g, ' ')}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500/10 px-2 py-1 rounded">
                                Start Practice
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
