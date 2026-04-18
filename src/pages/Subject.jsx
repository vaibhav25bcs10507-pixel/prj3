import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getStructure, getTopicsIndex } from '../services/questionsService'
import {
  ChevronLeft, PlayCircle, Layers, BookMarked, Atom, Calculator, FlaskConical, Target
} from 'lucide-react'

/* ── per-subject theming ─────────────────────────────── */
const SUBJECT_THEME = {
  physics:     { Icon: Atom,        accent: 'text-sky-400',    ring: 'ring-sky-500/40',    dot: 'bg-sky-500',    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  mathematics: { Icon: Calculator,  accent: 'text-violet-400', ring: 'ring-violet-500/40', dot: 'bg-violet-500', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  chemistry:   { Icon: FlaskConical,accent: 'text-emerald-400',ring: 'ring-emerald-500/40',dot: 'bg-emerald-500',badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

function getTheme(subject) {
  const key = subject?.toLowerCase() || ''
  return SUBJECT_THEME[key] || {
    Icon: BookMarked,
    accent: 'text-indigo-400',
    ring: 'ring-indigo-500/40',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  }
}

export default function Subject() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const examGroup = searchParams.get('examGroup')
  const exam = searchParams.get('exam')
  const subjectName = searchParams.get('subject')

  const [structure, setStructure] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topicsIndex, setTopicsIndex] = useState(null)

  useEffect(() => {
    let isMounted = true
    Promise.all([getStructure(), getTopicsIndex()]).then(([s, tIndex]) => {
      if (!isMounted) return
      setStructure(s)
      setTopicsIndex(tIndex)
      setLoading(false)
    }).catch(() => {
      if (isMounted) setLoading(false)
    })
    return () => { isMounted = false }
  }, [examGroup, exam, subjectName])

  const startQuiz = (division, chapter, topic = null) => {
    const params = new URLSearchParams({
      examGroup, exam, subject: subjectName, division, chapter,
    })
    if (topic) params.append('topic', topic)
    navigate(`/quiz?${params}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  const divisions = structure?.[examGroup]?.[exam]?.[subjectName]

  if (!loading && !divisions) {
    return (
      <div className="w-full px-6 lg:px-12 py-10 fade-up">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 cursor-pointer w-fit group"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={16} />
          </div>
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
        <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-10 text-center">
          <p className="text-zinc-500 text-sm">Subject data not found.</p>
        </div>
      </div>
    )
  }

  const theme = getTheme(subjectName)
  const { Icon } = theme
  const totalChapters = Object.values(divisions).reduce((s, chs) => s + chs.length, 0)

  return (
    <div className="w-full px-6 lg:px-12 py-10 fade-up max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 cursor-pointer w-fit group"
      >
        <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
          <ChevronLeft size={16} />
        </div>
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-zinc-800/50 shrink-0`}>
          <Icon size={32} className={theme.accent} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            <Layers size={14} className="text-zinc-600" />
            {examGroup?.toUpperCase()} · {exam?.replace(/-/g, ' ')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight capitalize">
            {subjectName}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className={`text-xs font-bold tracking-wider rounded-lg px-2.5 py-1 uppercase ${theme.badge}`}>
              {totalChapters} chapters
            </span>
            <span className="text-sm text-zinc-500 font-medium">
              {Object.keys(divisions).length} divisions
            </span>
          </div>
        </div>
      </div>

      {/* Topics list */}
      <div className="space-y-12">
        {Object.entries(divisions).map(([division, chapters]) => {
          return (
            <div key={division} className="space-y-6">
              {/* Division Header */}
              <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
                <div className={`w-3 h-3 rounded-full ${theme.dot}`} />
                <h2 className="text-2xl font-bold text-white capitalize tracking-tight">{division.replace(/-/g, ' ')}</h2>
                <span className="text-sm font-medium text-zinc-500 ml-2">{chapters.length} Chapters</span>
              </div>

              {/* Chapters Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {chapters.map((chapter) => {
                  const cacheKey = `${examGroup}/${exam}/${subjectName}/${division}/${chapter}.json`
                  const topics = topicsIndex?.[cacheKey] || []

                  return (
                    <div key={chapter} className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-colors flex flex-col h-full">
                      {/* Chapter Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <h3 className="text-lg font-bold text-zinc-200 capitalize truncate">{chapter.replace(/-/g, ' ')}</h3>
                        </div>
                        <button
                          onClick={() => startQuiz(division, chapter)}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Practice entire chapter"
                        >
                          <PlayCircle size={14} className={theme.accent} />
                          Practice
                        </button>
                      </div>

                      {/* Topics List */}
                      {topics.length > 0 && (
                        <div className="flex-1 flex flex-col gap-1.5 mt-2">
                          {topics.map(topic => (
                            <button
                              key={topic}
                              onClick={() => startQuiz(division, chapter, topic)}
                              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 transition-colors text-left group cursor-pointer border border-transparent hover:border-zinc-700/50 bg-black/20"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Target size={14} className="text-zinc-600 group-hover:text-zinc-400 shrink-0" />
                                <span className="text-sm text-zinc-400 group-hover:text-zinc-200 capitalize truncate">
                                  {topic.replace(/-/g, ' ')}
                                </span>
                              </div>
                              <PlayCircle size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
