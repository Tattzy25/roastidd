import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface LoadingScreenProps {
  onComplete: () => void
}

const BOOT_LINES = [
  "INITIALIZING ROSTER PROTOCOL...",
  "LOADING PERSONA MATRICES...",
  "CALIBRATING VISUAL ANALYSIS...",
  "ENGAGING THERMAL VOCAL CORE...",
  "ARMING ROAST ENGINE...",
  "SYSTEMS LIVE. STEP UP.",
]

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentLine, setCurrentLine] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12 + 4
        if (next >= 100) {
          clearInterval(interval)
          setReady(true)
          return 100
        }
        return next
      })
    }, 80)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const lineIdx = Math.min(
      Math.floor((progress / 100) * BOOT_LINES.length),
      BOOT_LINES.length - 1
    )
    setCurrentLine(lineIdx)
  }, [progress])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background scanline overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.78 0.18 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 145) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "grid-fade 4s ease-in-out infinite",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-5xl font-black tracking-tighter text-primary sm:text-7xl"
            style={{ animation: ready ? "none" : "glitch-shift 0.3s ease-in-out infinite" }}
          >
            ROASTIDD
          </h1>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground">
            Real-Time Roast Arena
          </p>
        </div>

        <div className="h-px w-64 overflow-hidden rounded-full bg-border sm:w-80">
          <div
            className="h-full rounded-full bg-primary transition-all duration-100 ease-out"
            style={{ width: `${progress}%`, boxShadow: "0 0 8px oklch(0.78 0.18 145)" }}
          />
        </div>

        <div className="flex h-5 items-center gap-2">
          {ready ? (
            <Button
              onClick={onComplete}
              size="lg"
              className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              style={{ animation: "slide-up-fade 0.3s ease-out" }}
            >
              Enter the Arena
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
              {BOOT_LINES[currentLine]}
            </span>
          )}
        </div>

        {!ready && (
          <div className="font-mono text-[10px] text-muted-foreground">
            {Math.floor(progress).toString().padStart(3, "0")}%
          </div>
        )}
      </div>
    </div>
  )
}
