import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import { getStructure } from '../services/questionsService'
import {
  ChevronDown, TrendingUp, CheckCircle2, Target, Atom, Calculator, FlaskConical, PlayCircle, BookMarked, Layers, Menu, X
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
// eslint-disable-next-line no-unused-vars
function StatCard({ value, label, sub, colorClass, icon: _IconComponent }) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border transition-colors bg-zinc-900 border-zinc-800/80 hover:border-zinc-700/80">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}>
        <_IconComponent size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-xs font-bold tracking-widest uppercase text-zinc-500">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-zinc-500">{sub}</p>}
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    getStructure().then(s => {
      setStructure(s)
      const firstGroup = Object.keys(s)[0]
      const firstExam  = firstGroup ? Object.keys(s[firstGroup])[0] : null
      setSelectedGroup(firstGroup)
      setSelectedExam(firstExam)
    }).finally(() => setLoading(false))
  }, [])

  // When the exam changes
  const handleSelectExam = (group, exam) => {
    setSelectedGroup(group)
    setSelectedExam(exam)
    setIsSidebarOpen(false) // auto-close on mobile
  }

  const { overallStats } = useMemo(() => {
    let attempted = 0, correct = 0
    let bookmarked = 0, mistakes = 0

    for (const [, p] of progressMap) {
      if (p.selectedOption != null) { 
        attempted++
        if (p.isCorrect) {
          correct++
        } else {
          mistakes++
        }
      }
      if (p.markedForReview) bookmarked++
    }
    const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : 0
    return {
      overallStats: { attempted, correct, accuracy },
      derivedStats: { bookmarked, mistakes }
    }
  }, [progressMap])

  const displayName = user?.email?.split('@')[0] || 'Student'

  // Derived from selections
  const examGroups = structure ? Object.keys(structure) : []
  const _exams     = (structure && selectedGroup) ? Object.keys(structure[selectedGroup]) : []
  const subjects   = (structure && selectedGroup && selectedExam)
    ? structure[selectedGroup][selectedExam]
    : {}

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 animate-spin border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] relative">
      {/* ── Permanent Mini Sidebar (Mobile Only) ── */}
      <div className="lg:hidden w-14 shrink-0 bg-zinc-900 border-r border-zinc-800/80 flex flex-col items-center py-4 sticky top-14 h-[calc(100vh-3.5rem)] z-30">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 top-14 left-14 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar Drawer (Mobile) / Permanent Sidebar (Desktop) ── */}
      <div className={`
        fixed bottom-0 left-0 z-40 w-72 bg-zinc-900 border-r border-zinc-800 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out
        lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:z-20
        ${isSidebarOpen ? 'translate-x-14 top-14 shadow-2xl lg:shadow-none' : '-translate-x-full top-14 lg:shadow-none'}
      `}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm font-bold text-white tracking-tight">Select Exam</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={20} />
          </button>
        </div>

        {/* Exam Selector */}
        <div className="flex flex-col gap-6">
          {examGroups.map((grp) => (
            <div key={grp}>
              <h3 className="pl-3 mb-2 font-bold tracking-widest uppercase text-[10px] text-zinc-500">{fmtGroup(grp)}</h3>
              <div className="flex flex-col gap-1.5">
                {Object.keys(structure[grp] || {}).map((ex) => {
                  const isSelected = selectedGroup === grp && selectedExam === ex
                  return (
                    <button
                      key={ex}
                      onClick={() => handleSelectExam(grp, ex)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left w-full
                        ${isSelected
                          ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20'
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                        }`}
                    >
                      <Layers size={16} className={isSelected ? 'text-indigo-400' : 'text-zinc-500'} />
                      {fmtExam(ex)}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="flex-1 w-full min-w-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 fade-up">
          <div className="flex flex-col gap-8 items-start lg:gap-12">
            
            {/* ── Right Content Area ── */}
            <div className="flex-1 space-y-10 w-full min-w-0">
              
              {/* Hero greeting */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-1.5">Dashboard</p>
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Hey, <span className="capitalize gradient-text">{displayName}</span>
                  </h1>
                  <p className="mt-2 text-sm text-zinc-400">Pick up where you left off or start a new chapter.</p>
                </div>
                <div className="flex gap-2 items-center py-1.5 px-3 font-medium rounded-full border text-[11px] bg-zinc-900/50 border-zinc-800 text-zinc-400">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  {fmtGroup(selectedGroup)} {fmtExam(selectedExam)}
                </div>
              </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 stagger">
            <StatCard
              value={overallStats.attempted}
              label="Attempted"
              sub="questions total"
              colorClass="bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
              icon={Target}
            />
            <StatCard
              value={overallStats.correct}
              label="Correct"
              sub={`out of ${overallStats.attempted}`}
              colorClass="bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
              icon={CheckCircle2}
            />
            <StatCard
              value={`${overallStats.accuracy}%`}
              label="Accuracy"
              sub={overallStats.attempted > 0 ? (overallStats.accuracy >= 70 ? 'Great work!' : overallStats.accuracy >= 40 ? 'Keep going!' : 'Room to grow') : 'No data yet'}
              colorClass="bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
              icon={TrendingUp}
            />
          </div>

          {/* Course Syllabus */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold tracking-tight text-white">Course Syllabus</h2>
            </div>

            {Object.keys(subjects).length === 0 ? (
            <div className="p-10 text-center rounded-2xl border bg-zinc-900 border-zinc-800/80">
              <p className="text-sm text-zinc-500">No subjects available for this exam.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(subjects).map(([subject, divisions]) => {
              const theme = getTheme(subject)
              const { Icon } = theme
              const totalChapters = Object.values(divisions).reduce((s, chs) => s + chs.length, 0)

              return (
                <button
                  key={subject}
                  onClick={() => navigate(`/subject?examGroup=${selectedGroup}&exam=${selectedExam}&subject=${subject}`)}
                  className="flex flex-col gap-4 items-start p-5 text-left rounded-2xl border transition-all cursor-pointer bg-zinc-900 border-zinc-800/80 group hover:border-zinc-700/80 hover:bg-zinc-800/30"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-800/50 group-hover:bg-zinc-800 transition-colors`}>
                    <Icon size={20} className={theme.accent} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-white capitalize">{subject}</h3>
                    <div className="flex items-center mt-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider rounded-md px-1.5 py-0.5 ${theme.badge}`}>
                        {totalChapters} chapters
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </div>
    </div>
    </div>
    </div>
  )
}
