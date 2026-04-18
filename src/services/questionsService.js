const BASE = import.meta.env.BASE_URL // e.g. "/prj3/"

// In-memory caches
const questionsCache = new Map()
let topicsIndex = null
let structureCache = null

/**
 * Load the topics_index.json once and cache it.
 */
export async function getTopicsIndex() {
  if (topicsIndex) return topicsIndex
  const res = await fetch(`${BASE}examgroups/topics_index.json`)
  if (!res.ok) throw new Error('Failed to load topics index')
  topicsIndex = await res.json()
  return topicsIndex
}

/**
 * Derive the full structure from the topics_index.
 * Returns: { [examGroup]: { [exam]: { [subject]: { [division]: [chapter, ...] } } } }
 *
 * The keys in topics_index look like:
 *   "jee/jee-main/physics/electricity/alternating-current.json"
 */
export async function getStructure() {
  if (structureCache) return structureCache

  const index = await getTopicsIndex()
  const structure = {}

  for (const key of Object.keys(index)) {
    // key = "jee/jee-main/physics/electricity/alternating-current.json"
    const parts = key.split('/')
    if (parts.length < 5) continue

    const [examGroup, exam, subject, division, chapterFile] = parts
    const chapter = chapterFile.replace('.json', '')

    if (!structure[examGroup]) structure[examGroup] = {}
    if (!structure[examGroup][exam]) structure[examGroup][exam] = {}
    if (!structure[examGroup][exam][subject]) structure[examGroup][exam][subject] = {}
    if (!structure[examGroup][exam][subject][division]) {
      structure[examGroup][exam][subject][division] = []
    }

    const chapters = structure[examGroup][exam][subject][division]
    if (!chapters.includes(chapter)) {
      chapters.push(chapter)
      chapters.sort()
    }
  }

  structureCache = structure
  return structure
}

/**
 * Get list of exam groups (e.g. ["jee"])
 */
export async function getExamGroups() {
  const structure = await getStructure()
  return Object.keys(structure).sort()
}

/**
 * Get exams under an exam group (e.g. ["jee-main"])
 */
export async function getExams(examGroup) {
  const structure = await getStructure()
  return Object.keys(structure[examGroup] || {}).sort()
}

/**
 * Get subjects for an exam (e.g. ["physics", "mathematics", "chemistry"])
 */
export async function getSubjects(examGroup, exam) {
  const structure = await getStructure()
  return Object.keys(structure?.[examGroup]?.[exam] || {}).sort()
}

/**
 * Get divisions (e.g. ["mechanics", "electricity", ...])
 */
export async function getDivisions(examGroup, exam, subject) {
  const structure = await getStructure()
  return Object.keys(structure?.[examGroup]?.[exam]?.[subject] || {}).sort()
}

/**
 * Get chapters (e.g. ["alternating-current", "capacitor", ...])
 */
export async function getChapters(examGroup, exam, subject, division) {
  const structure = await getStructure()
  return (structure?.[examGroup]?.[exam]?.[subject]?.[division] || []).slice().sort()
}

/**
 * Get topics for a chapter from topics_index.
 */
export async function getTopics(examGroup, exam, subject, division, chapter) {
  const index = await getTopicsIndex()
  const key = `${examGroup}/${exam}/${subject}/${division}/${chapter}.json`
  return index[key] || []
}

/**
 * Load questions for a specific chapter file.
 * Returns array of question objects with id and source metadata injected.
 */
async function loadChapterQuestions(examGroup, exam, subject, division, chapter) {
  const cacheKey = `${examGroup}/${exam}/${subject}/${division}/${chapter}`
  if (questionsCache.has(cacheKey)) return questionsCache.get(cacheKey)

  const url = `${BASE}examgroups/${examGroup}/${exam}/${subject}/${division}/${chapter}.json`
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`Failed to load ${url}: ${res.status}`)
    return []
  }

  const raw = await res.json()
  const questions = Array.isArray(raw) ? raw : []

  // Inject id & source metadata
  const enriched = questions
    .filter((q) => q.content)
    .map((q, index) => ({
      ...q,
      id: `${examGroup}/${exam}/${subject}/${division}/${chapter}.json:${index}`,
      source: { examGroup, exam, subject, division, chapter, index },
    }))

  questionsCache.set(cacheKey, enriched)
  return enriched
}

/**
 * Load questions with filters.
 * At minimum examGroup and exam must be provided.
 * If chapter is provided, loads that single file.
 * If only subject/division is provided, loads all chapters underneath.
 * If topic is also provided, filters questions by topic field.
 */
export async function loadFilteredQuestions(filters) {
  const { examGroup, exam, subject, division, chapter, topic } = filters

  if (!examGroup || !exam) return []

  let chaptersToLoad = []

  if (subject && division && chapter) {
    chaptersToLoad = [{ subject, division, chapter }]
  } else if (subject && division) {
    const chapters = await getChapters(examGroup, exam, subject, division)
    chaptersToLoad = chapters.map((ch) => ({ subject, division, chapter: ch }))
  } else if (subject) {
    const divisions = await getDivisions(examGroup, exam, subject)
    for (const div of divisions) {
      const chapters = await getChapters(examGroup, exam, subject, div)
      chaptersToLoad.push(...chapters.map((ch) => ({ subject, division: div, chapter: ch })))
    }
  } else {
    const subjects = await getSubjects(examGroup, exam)
    for (const subj of subjects) {
      const divisions = await getDivisions(examGroup, exam, subj)
      for (const div of divisions) {
        const chapters = await getChapters(examGroup, exam, subj, div)
        chaptersToLoad.push(...chapters.map((ch) => ({ subject: subj, division: div, chapter: ch })))
      }
    }
  }

  // Load all chapter files in parallel
  const results = await Promise.all(
    chaptersToLoad.map((c) => loadChapterQuestions(examGroup, exam, c.subject, c.division, c.chapter))
  )

  let allQuestions = results.flat()

  // Filter by topic if provided
  if (topic) {
    allQuestions = allQuestions.filter((q) => q.topic === topic)
  }

  return allQuestions
}
