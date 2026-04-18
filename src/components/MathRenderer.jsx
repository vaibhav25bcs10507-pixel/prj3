import { useEffect, useRef } from 'react'

// Global queue to ensure MathJax typesetting doesn't overlap and cause errors
let typesetQueue = Promise.resolve()

export default function MathRenderer({ html, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !window.MathJax) return

    let isMounted = true

    // Add this component's typesetting to the global queue
    typesetQueue = typesetQueue
      .then(() => {
        if (!isMounted || !containerRef.current) return

        // Make sure startup is complete
        const p = window.MathJax.startup?.promise || Promise.resolve()
        return p.then(() => {
          if (!isMounted || !containerRef.current) return

          // Clear previous state for this element
          if (typeof window.MathJax.typesetClear === 'function') {
            try { window.MathJax.typesetClear([containerRef.current]) } catch (e) { /* ignore */ }
          }

          // Typeset
          if (typeof window.MathJax.typesetPromise === 'function') {
            return window.MathJax.typesetPromise([containerRef.current])
          }
        })
      })
      .catch((err) => {
        console.warn('MathJax typeset error:', err.message)
      })

    return () => {
      isMounted = false
    }
  }, [html])

  if (!html) return null

  return (
    <div
      ref={containerRef}
      className={`question-html ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
