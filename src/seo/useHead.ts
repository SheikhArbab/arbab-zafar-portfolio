import { useEffect } from 'react'
import { applyHead, type HeadData } from './head'

export function useHead(head: HeadData | null) {
  const key = head ? `${head.title}|${head.canonical}|${head.description}` : ''
  useEffect(() => {
    if (head) applyHead(head)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
