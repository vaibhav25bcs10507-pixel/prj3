import { useEffect, useRef, memo } from 'react'

// Global queue to ensure MathJax typesetting doesn't overlap and cause errors
let typesetQueue = Promise.resolve()

const MathRenderer = memo(function MathRenderer({ html, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !window.MathJax) return

    let isMounted = true

    // 1. Manually set innerHTML to decouple the rendered MathJax DOM from React's diffing engine.
    // If React renders MathJax elements, they get destroyed when React re-renders this component.
    containerRef.current.innerHTML = html

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

  // Removing dangerouslySetInnerHTML forces React to ignore the contents of this div!
  return <div ref={containerRef} className={`question-html ${className}`} />
})

export default MathRenderer
