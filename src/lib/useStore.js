import { useEffect, useState } from 'react'
import { subscribe, getState } from './store'

// Re-render a component whenever the store changes.
export function useStore() {
  const [, setTick] = useState(0)
  useEffect(() => subscribe(() => setTick((t) => t + 1)), [])
  return getState()
}
