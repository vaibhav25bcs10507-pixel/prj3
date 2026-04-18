import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getExamGroups,
  getExams,
  getSubjects,
  getDivisions,
  getChapters,
  getTopics,
} from '../services/questionsService'

/**
 * Hook to manage cascading filter dropdowns.
 * Returns the current selections, option lists, and setters.
 */
export default function useFilter() {
  const [examGroup, setExamGroup] = useState('')
  const [exam, setExam] = useState('')
  const [subject, setSubject] = useState('')
  const [division, setDivision] = useState('')
  const [chapter, setChapter] = useState('')
  const [topic, setTopic] = useState('')

  // Option lists
  const [examGroups, setExamGroups] = useState([])
  const [exams, setExams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [divisions, setDivisions] = useState([])
  const [chapters, setChapters] = useState([])
  const [topics, setTopics] = useState([])

  // Load exam groups on mount
  useEffect(() => {
    getExamGroups().then(setExamGroups)
  }, [])

  // When examGroup changes -> load exams
  useEffect(() => {
    if (!examGroup) { setExams([]); setExam(''); return }
    getExams(examGroup).then((list) => {
      setExams(list)
      // Auto-select if there's only one exam
      if (list.length === 1) setExam(list[0])
      else setExam('')
    })
  }, [examGroup])

  // When exam changes -> load subjects
  useEffect(() => {
    if (!examGroup || !exam) { setSubjects([]); setSubject(''); return }
    getSubjects(examGroup, exam).then((list) => {
      setSubjects(list)
      setSubject('')
    })
  }, [examGroup, exam])

  // When subject changes -> load divisions
  useEffect(() => {
    if (!subject) { setDivisions([]); setDivision(''); return }
    getDivisions(examGroup, exam, subject).then((list) => {
      setDivisions(list)
      setDivision('')
    })
  }, [examGroup, exam, subject])

  // When division changes -> load chapters
  useEffect(() => {
    if (!division) { setChapters([]); setChapter(''); return }
    getChapters(examGroup, exam, subject, division).then((list) => {
      setChapters(list)
      setChapter('')
    })
  }, [examGroup, exam, subject, division])

  // When chapter changes -> load topics
  useEffect(() => {
    if (!chapter) { setTopics([]); setTopic(''); return }
    getTopics(examGroup, exam, subject, division, chapter).then((list) => {
      setTopics(list)
      setTopic('')
    })
  }, [examGroup, exam, subject, division, chapter])

  const resetFilters = useCallback(() => {
    setExamGroup('')
    setExam('')
    setSubject('')
    setDivision('')
    setChapter('')
    setTopic('')
  }, [])

  const currentFilters = useMemo(() => ({
    examGroup, exam, subject, division, chapter, topic,
  }), [examGroup, exam, subject, division, chapter, topic])

  return {
    // Current selections
    examGroup, exam, subject, division, chapter, topic,
    // Setters
    setExamGroup, setExam, setSubject, setDivision, setChapter, setTopic,
    // Option lists
    examGroups, exams, subjects, divisions, chapters, topics,
    // Helpers
    resetFilters,
    currentFilters,
  }
}
