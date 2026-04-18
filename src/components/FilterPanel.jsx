import { useMemo } from 'react'
import { Filter, RotateCcw, Play } from 'lucide-react'

function formatLabel(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function SelectField({ label, value, onChange, options, disabled, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {formatLabel(opt)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FilterPanel({
  filterHook,
  onApply,
  loading,
}) {
  const {
    examGroup, exam, subject, division, chapter, topic,
    setExamGroup, setExam, setSubject, setDivision, setChapter, setTopic,
    examGroups, exams, subjects, divisions, chapters, topics,
    resetFilters,
  } = filterHook

  const canApply = useMemo(() => {
    return examGroup && exam
  }, [examGroup, exam])

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={18} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-200">Filters</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <SelectField
          label="Exam Group"
          value={examGroup}
          onChange={setExamGroup}
          options={examGroups}
          placeholder="Select Exam Group"
        />
        <SelectField
          label="Exam"
          value={exam}
          onChange={setExam}
          options={exams}
          disabled={!examGroup}
          placeholder="Select Exam"
        />
        <SelectField
          label="Subject"
          value={subject}
          onChange={setSubject}
          options={subjects}
          disabled={!exam}
          placeholder="All Subjects"
        />
        <SelectField
          label="Division"
          value={division}
          onChange={setDivision}
          options={divisions}
          disabled={!subject}
          placeholder="All Divisions"
        />
        <SelectField
          label="Chapter"
          value={chapter}
          onChange={setChapter}
          options={chapters}
          disabled={!division}
          placeholder="All Chapters"
        />
        <SelectField
          label="Topic"
          value={topic}
          onChange={setTopic}
          options={topics}
          disabled={!chapter}
          placeholder="All Topics"
        />
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800">
        <button
          onClick={onApply}
          disabled={!canApply || loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 
                     disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg 
                     transition-colors cursor-pointer"
        >
          <Play size={14} />
          {loading ? 'Loading...' : 'Load Questions'}
        </button>
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 
                     transition-colors cursor-pointer bg-transparent border-none"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  )
}
