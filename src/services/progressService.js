import { supabase } from './supabase'

/**
 * Fetch all progress rows for the current user.
 * Returns a Map: questionId -> { selected_option, is_correct, marked_for_review, attempted_at }
 */
export async function fetchUserProgress(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('question_id, selected_option, is_correct, marked_for_review, attempted_at')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching progress:', error)
    return new Map()
  }

  const map = new Map()
  for (const row of data) {
    map.set(row.question_id, {
      selectedOption: row.selected_option,
      isCorrect: row.is_correct,
      markedForReview: row.marked_for_review,
      attemptedAt: row.attempted_at,
    })
  }
  return map
}

/**
 * Record an attempt (upsert — one row per user+question).
 */
export async function recordAttempt(userId, questionId, selectedOption, isCorrect) {
  const { error } = await supabase
    .from('progress')
    .upsert(
      {
        user_id: userId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        attempted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,question_id' }
    )

  if (error) console.error('Error recording attempt:', error)
  return !error
}

/**
 * Toggle mark-for-review flag.
 */
export async function toggleReview(userId, questionId, marked) {
  // First check if row exists
  const { data } = await supabase
    .from('progress')
    .select('id')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle()

  if (data) {
    // Update existing row
    const { error } = await supabase
      .from('progress')
      .update({ marked_for_review: marked })
      .eq('user_id', userId)
      .eq('question_id', questionId)

    if (error) console.error('Error toggling review:', error)
    return !error
  } else {
    // Insert a new row (not attempted yet, just marked for review)
    const { error } = await supabase
      .from('progress')
      .insert({
        user_id: userId,
        question_id: questionId,
        selected_option: null,
        is_correct: false,
        marked_for_review: marked,
      })

    if (error) console.error('Error inserting review mark:', error)
    return !error
  }
}

/**
 * Get stats for a specific set of question IDs.
 * Returns { attempted, correct, total, reviewCount }
 */
export function computeStats(progressMap, questionIds) {
  let attempted = 0
  let correct = 0
  let reviewCount = 0

  for (const qid of questionIds) {
    const p = progressMap.get(qid)
    if (p) {
      if (p.selectedOption !== null) {
        attempted++
        if (p.isCorrect) correct++
      }
      if (p.markedForReview) reviewCount++
    }
  }

  return {
    total: questionIds.length,
    attempted,
    correct,
    reviewCount,
    percentage: questionIds.length > 0 ? (attempted / questionIds.length) * 100 : 0,
  }
}
