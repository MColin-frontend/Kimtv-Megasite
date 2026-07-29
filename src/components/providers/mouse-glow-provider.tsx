"use client"

import { useEffect, useRef } from "react"

const SPARKLE_COLORS = ["#f5c518", "#ffffff", "#ffd700", "#fffacd", "#e0b0ff"]

export function MouseGlowProvider({ children }: { children: React.ReactNode }) {
  const glowRef = useRef<HTMLDivElement>(null)
  const sparkleContainerRef = useRef<HTMLDivElement>(null)
  const lastSparkleTime = useRef(0)

  useEffect(() => {
    const glow = glowRef.current
    const sparkleContainer = sparkleContainerRef.current
    if (!glow || !sparkleContainer) return

    const spawnSparkles = (x: number, y: number) => {
      for (let i = 0; i < 2; i++) {
        const el = document.createElement("span")
        const size = Math.random() * 4 + 2
        const angle = Math.random() * 360
        const dist = Math.random() * 28 + 8
        const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)]
        el.style.cssText = `
          position:fixed;left:${x}px;top:${y}px;
          width:${size}px;height:${size}px;background:${color};border-radius:50%;
          pointer-events:none;
          --dx:${Math.cos((angle * Math.PI) / 180) * dist}px;
          --dy:${Math.sin((angle * Math.PI) / 180) * dist + 12}px;
          opacity:0.45;animation:sparkle-fall 0.65s ease-out forwards;
          box-shadow:0 0 ${size + 2}px ${color};
        `
        sparkleContainer.appendChild(el)
        setTimeout(() => el.remove(), 650)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      glow.style.setProperty("--glow-x", `${e.clientX}px`)
      glow.style.setProperty("--glow-y", `${e.clientY}px`)

      const now = Date.now()
      if (now - lastSparkleTime.current < 40) return
      lastSparkleTime.current = now
      spawnSparkles(e.clientX, e.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      <div
        ref={glowRef}
        className="pointer-events-none fixed inset-0 z-[9998]"
        style={{
          background:
            "radial-gradient(circle 160px at var(--glow-x, -999px) var(--glow-y, -999px), rgba(74,140,255,0.08), transparent 70%)",
        }}
      />
      <div
        ref={sparkleContainerRef}
        className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      />
      {children}
    </>
  )
}
