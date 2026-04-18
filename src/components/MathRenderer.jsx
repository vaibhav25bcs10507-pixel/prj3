import { useCallback, useRef } from 'react'

/**
 * Renders raw HTML content and triggers MathJax typesetting.
 * Uses useRef to target the container and useCallback for the typeset function.
 */
export default function MathRenderer({ html, className = '' }) {
  const containerRef = useRef(null)

  const typesetMath = useCallback((node) => {
    containerRef.current = node
    if (!node || !window.MathJax) return

    if (typeof MathJax.typesetPromise === 'function') {
      MathJax.typesetPromise([node]).catch((err) =>
        console.warn('MathJax typeset error:', err.message)
      )
    } else if (typeof MathJax.typeset === 'function') {
      try {
        MathJax.typeset([node])
      } catch (err) {
        console.warn('MathJax typeset error:', err.message)
      }
    }
  }, [html]) // re-run when html changes

  if (!html) return null

  return (
    <div
      ref={typesetMath}
      className={`question-html ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
