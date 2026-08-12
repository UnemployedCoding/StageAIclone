'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold mb-4 text-primary">Something went wrong!</h2>
      <p className="text-slate-600 mb-6">An unexpected error has occurred.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  )
}
