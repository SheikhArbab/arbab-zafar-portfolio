import { useEffect, useState } from 'react'

/** Cycles through words with a type/erase effect. SSR & reduced-motion render the first word statically. */
export function useTypewriter(words: string[], enabled: boolean, { type = 55, erase = 28, hold = 1800 } = {}) {
  const list = words.filter(Boolean)
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(list[0] ?? '')
  const [phase, setPhase] = useState<'hold' | 'erase' | 'type'>('hold')

  useEffect(() => {
    if (!enabled || list.length < 2) {
      setText(list[0] ?? '')
      return
    }
    const word = list[index % list.length]
    let t: ReturnType<typeof setTimeout>
    if (phase === 'hold') t = setTimeout(() => setPhase('erase'), hold)
    else if (phase === 'erase') {
      if (text.length === 0) {
        setIndex((i) => (i + 1) % list.length)
        setPhase('type')
      } else t = setTimeout(() => setText(text.slice(0, -1)), erase)
    } else {
      const next = list[index % list.length]
      if (text === next) setPhase('hold')
      else t = setTimeout(() => setText(next.slice(0, text.length + 1)), type)
    }
    void word
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, phase, text, index, list.join('|')])

  return text
}
