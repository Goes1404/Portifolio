import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/** Live São Paulo clock — the small "where I am, right now" signature. */
export default function LocalClock({ className = '' }) {
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className={`font-code text-[11px] tracking-[0.25em] text-white/45 tabular-nums ${className}`}>
      SÃO PAULO <span className="text-white/25">·</span> {now}
    </span>
  )
}
