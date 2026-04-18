import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import { getStructure } from '../services/questionsService'
import {
  ChevronRight, ChevronDown,
  TrendingUp, CheckCircle2, Target,
  Atom, Calculator, FlaskConical,
  PlayCircle, BookMarked, ChevronDown as ChevDown,
  GraduationCap, Layers,
} from 'lucide-react'

/* ── per-subject theming ─────────────────────────────── */
const SUBJECT_THEME = {
  physics:     { Icon: Atom,        accent: 'text-sky-400',    ring: 'ring-sky-500/40',    dot: 'bg-sky-500',    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  mathematics: { Icon: Calculator,  accent: 'text-violet-400', ring: 'ring-violet-500/40', dot: 'bg-violet-500', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  chemistry:   { Icon: FlaskConical,accent: 'text-emerald-400',ring: 'ring-emerald-500/40',dot: 'bg-emerald-500',badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

function getTheme(subject) {
  const key = subject.toLowerCase()
  return SUBJECT_THEME[key] || {
    Icon: BookMarked,
    accent: 'text-indigo-400',
    ring: 'ring-indigo-500/40',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  }
}

/* ── stat card ───────────────────────────────────────── */
function StatCard({ value, label, sub, colorClass, icon: Icon }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-zinc-500 mt-1 font-medium uppercase tracking-wider">{label}</p>
        {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ── exam group / exam display labels ───────────────── */
const GROUP_LABELS = { jee: 'JEE', neet: 'NEET', upsc: 'UPSC', cat: 'CAT' }
const EXAM_LABELS  = { 'jee-main': 'JEE Main', 'jee-advanced': 'JEE Advanced', 'neet-ug': 'NEET UG' }

const fmtGroup = (g) => GROUP_LABELS[g] || g.toUpperCase()
const fmtExam  = (e) => EXAM_LABELS[e]  || e.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function Dashboard() {
  const { user } = useAuth()
  const { progressMap } = useQuiz()
  const navigate = useNavigate()

  const [structure, setStructure]         = useState(null)
  const [loading, setLoading]             = useState(true)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedExam, setSelectedExam]   = useState(null)
  const [expandedSubject, setExpandedSubject]   = useState(null)
  const [expandedDivision, setExpandedDivision] = useState(null)

  useEffect(() => {
    getStructure().then(s => {
      setStructure(s)
      const firstGroup = Object.keys(s)[0]
      const firstExam  = firstGroup ? Object.keys(s[firstGroup])[0] : null
      setSelectedGroup(firstGroup)
      setSelectedExam(firstExam)
      // Auto-open the first subject
      if (firstGroup && firstExam) {
        setExpandedSubject(Object.keys(s[firstGroup][firstExam])[0])
      }
    }).finally(() => setLoading(false))
  }, [])

  // When the exam changes, reset accordion and auto-open first subject
  const handleSelectExam = (group, exam) => {
    setSelectedGroup(group)
    setSelectedExam(exam)
    setExpandedSubject(structure?.[group]?.[exam] ? Object.keys(structure[group][exam])[0] : null)
    setExpandedDivision(null)
  }

  const overallStats = useMemo(() => {
    let attempted = 0, correct = 0
    for (const [, p] of progressMap) {
      if (p.selectedOption != null) { attempted++; if (p.isCorrect) correct++ }
    }
    const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : 0
    return { attempted, correct, accuracy }
  }, [progressMap])

  const displayName = user?.email?.split('@')[0] || 'Student'

  // Derived from selections
  const examGroups = structure ? Object.keys(structure) : []
  const exams      = (structure && selectedGroup) ? Object.keys(structure[selectedGroup]) : []
  const subjects   = (structure && selectedGroup && selectedExam)
    ? structure[selectedGroup][selectedExam]
    : {}

  const toggleSubject = (subj) => {
    setExpandedSubject(expandedSubject === subj ? null : subj)
    setExpandedDivision(null)
  }
  const toggleDivision = (div) => {
    setExpandedDivision(expandedDivision === div ? null : div)
  }
  const startQuiz = (subject, division, chapter) => {
    const params = new URLSearchParams({
      examGroup: selectedGroup, exam: selectedExam, subject, division, chapter,
    })
    navigate(`/quiz?${params}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 fade-up">

      {/* ── Hero greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Hey, <span className="gradient-text capitalize">{displayName}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">Pick up where you left off or start a new chapter.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {fmtGroup(selectedGroup)} {fmtExam(selectedExam)} · All Subjects
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <StatCard
          value={overallStats.attempted}
          label="Attempted"
          sub="questions total"
          colorClass="bg-indigo-500/10 text-indigo-400"
          icon={Target}
        />
        <StatCard
          value={overallStats.correct}
          label="Correct"
          sub={`out of ${overallStats.attempted}`}
          colorClass="bg-emerald-500/10 text-emerald-400"
          icon={CheckCircle2}
        />
        <StatCard
          value={`${overallStats.accuracy}%`}
          label="Accuracy"
          sub={overallStats.attempted > 0 ? (overallStats.accuracy >= 70 ? 'Great work!' : overallStats.accuracy >= 40 ? 'Keep going!' : 'Room to grow') : 'No data yet'}
          colorClass="bg-amber-500/10 text-amber-400"
          icon={TrendingUp}
        />
      </div>

      {/* ── Syllabus explorer ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="text-base font-semibold text-white">Course Syllabus</h2>

          {/* ── Exam Selector Tabs ── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {examGroups.map((grp) => (
              Object.keys(structure[grp] || {}).map((ex) => {
                const isSelected = selectedGroup === grp && selectedExam === ex
                return (
                  <button
                    key={`${grp}-${ex}`}
                    onClick={() => handleSelectExam(grp, ex)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border cursor-pointer
                      ${isSelected
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                  >
                    <Layers size={13} className={isSelected ? 'text-indigo-400' : 'text-zinc-500'} />
                    {fmtGroup(grp)} · {fmtExam(ex)}
                  </button>
                )
              })
            ))}
          </div>
        </div>

        {Object.keys(subjects).length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
            <p className="text-zinc-500 text-sm">No subjects available for this exam.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(subjects).map(([subject, divisions]) => {
              const theme = getTheme(subject)
              const { Icon } = theme
              const isExpanded = expandedSubject === subject
              const totalChapters = Object.values(divisions).reduce((s, chs) => s + chs.length, 0)

              return (
              <div
                key={subject}
                className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-200
                  ${isExpanded ? `border-zinc-700 ring-1 ${theme.ring}` : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                {/* Subject header */}
                <button
                  onClick={() => toggleSubject(subject)}
                  className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700/80 transition-colors`}>
                      <Icon size={18} className={theme.accent} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white capitalize">{subject}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${theme.badge}`}>
                          {totalChapters} chapters
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all
                    ${isExpanded ? 'bg-zinc-700 rotate-0' : 'bg-zinc-800'}`}>
                    {isExpanded
                      ? <ChevronDown size={14} className="text-zinc-400" />
                      : <ChevronRight size={14} className="text-zinc-500" />}
                  </div>
                </button>

                {/* Divisions */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-3 pb-3 pt-2 space-y-1.5">
                    {Object.entries(divisions).map(([division, chapters]) => {
                      const isDivExpanded = expandedDivision === division
                      return (
                        <div key={division} className="rounded-xl overflow-hidden">
                          {/* Division header */}
                          <button
                            onClick={() => toggleDivision(division)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-800/40 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer border-none text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                              <span className="text-sm font-medium text-zinc-200 capitalize">
                                {division.replace(/-/g, ' ')}
                              </span>
                              <span className="text-xs text-zinc-600 ml-1">({chapters.length})</span>
                            </div>
                            {isDivExpanded
                              ? <ChevronDown size={13} className="text-zinc-500" />
                              : <ChevronRight size={13} className="text-zinc-600" />}
                          </button>

                          {/* Chapters */}
                          {isDivExpanded && (
                            <div className="mt-1 space-y-0.5 pl-2">
                              {chapters.map((chapter) => (
                                <button
                                  key={chapter}
                                  onClick={() => startQuiz(subject, division, chapter)}
                                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-zinc-800/60 group transition-all cursor-pointer border-none bg-transparent text-left"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-zinc-500 transition-colors flex-shrink-0" />
                                    <span className="text-sm text-zinc-400 group-hover:text-zinc-100 capitalize transition-colors truncate">
                                      {chapter.replace(/-/g, ' ')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                    <PlayCircle size={14} className="text-indigo-400" />
                                    <span className="text-xs text-indigo-400 font-medium">Practice</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-zinc-600 mt-5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {fmtGroup(selectedGroup)} {fmtExam(selectedExam)} · All Subjects
        </div>
      </div>
    </div>
  )
}
