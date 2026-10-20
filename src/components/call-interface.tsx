import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PhoneOff, Mic, MicOff, AlertTriangle } from "lucide-react"
import type { Persona, PricingTier } from "@/types"
import { useGeminiLive } from "@/hooks/use-gemini-live"
import { cn } from "@/lib/utils"

interface CallInterfaceProps {
  persona: Persona
  tier: PricingTier
  onEnd: (reason: "completed" | "aborted" | "choked") => void
}

export function CallInterface({ persona, tier, onEnd }: CallInterfaceProps) {
  const {
    status,
    error,
    isAiSpeaking,
    userTranscript,
    aiTranscript,
    videoStream,
    startCall,
    endCall,
    sendAudioStreamEnd,
  } = useGeminiLive()

  const [remainingMs, setRemainingMs] = useState(tier.duration * 1000)
  const [muted, setMuted] = useState(false)
  const [pressure, setPressure] = useState(0)
  const [choked, setChoked] = useState(false)
  const startTimeRef = useRef<number>(0)
  const lastUserSpeechRef = useRef<number>(Date.now())
  const videoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    startCall(persona)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (videoStream.current && videoRef.current) {
      videoRef.current.srcObject = videoStream.current
      videoRef.current.play().catch(() => {})
    }
  }, [videoStream])

  useEffect(() => {
    if (status !== "live") return
    startTimeRef.current = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = tier.duration * 1000 - elapsed
      setRemainingMs(Math.max(0, remaining))

      if (remaining <= 0) {
        clearInterval(interval)
        endCall()
        onEnd("completed")
      }
    }, 16)

    return () => clearInterval(interval)
  }, [status, tier.duration, endCall, onEnd])

  useEffect(() => {
    if (status !== "live") return
    if (!userTranscript) return
    lastUserSpeechRef.current = Date.now()
    setPressure(0)
  }, [userTranscript, status])

  useEffect(() => {
    if (status !== "live") return
    if (isAiSpeaking) return

    const interval = setInterval(() => {
      const silenceDuration = Date.now() - lastUserSpeechRef.current
      const newPressure = Math.min(100, (silenceDuration / 12000) * 100)
      setPressure(newPressure)

      if (newPressure >= 100 && !choked) {
        setChoked(true)
        endCall()
        onEnd("choked")
      }
    }, 200)

    return () => clearInterval(interval)
  }, [status, isAiSpeaking, choked, endCall, onEnd])

  function handleAbort() {
    endCall()
    onEnd("aborted")
  }

  function toggleMute() {
    setMuted((m) => {
      const next = !m
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !next))
      }
      if (next) {
        sendAudioStreamEnd()
      }
      return next
    })
  }

  function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSec / 60)
    const seconds = totalSec % 60
    const millis = Math.floor((ms % 1000) / 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${millis.toString().padStart(2, "0")}`
  }

  const isConnecting = status === "connecting"
  const isLive = status === "live"
  const isError = status === "error"

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background scanline overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.78 0.18 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 145) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Top bar: persona info + timer */}
        <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={persona.avatar}
              alt={persona.street_name}
              className="h-10 w-10 rounded-md object-cover ring-1 ring-primary/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-foreground">
                  {persona.street_name}
                </span>
                {isAiSpeaking && (
                  <Badge className="border-primary/40 bg-primary/10 text-[9px] text-primary">
                    <span
                      className="mr-1 size-1.5 rounded-full bg-primary"
                      style={{ animation: "flicker 0.5s ease-in-out infinite" }}
                    />
                    SPEAKING
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {tier.label} · {tier.priceDisplay}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={cn(
                "font-mono text-2xl font-black tabular-nums tracking-tight",
                remainingMs < 10000 ? "text-destructive" : "text-primary"
              )}
              style={
                remainingMs < 10000
                  ? { animation: "countdown-pulse 0.5s ease-in-out infinite" }
                  : undefined
              }
            >
              {formatTime(remainingMs)}
            </div>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
              Time Remaining
            </span>
          </div>
        </div>

        {/* Main area: video feed + transcripts */}
        <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3 sm:flex-row">
          <div className="relative flex-1 overflow-hidden rounded-lg border border-border/50 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 backdrop-blur-sm">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    isLive ? "bg-primary" : "bg-muted-foreground",
                    isLive && "animate-pulse"
                  )}
                />
                <span className="text-[9px] font-mono uppercase tracking-wider text-foreground">
                  {isConnecting ? "Connecting..." : isLive ? "Live" : isError ? "Error" : "Ended"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 backdrop-blur-sm">
                <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                  {persona.street_name} is watching
                </span>
              </div>
            </div>

            {isConnecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-xs font-mono uppercase tracking-wider text-primary">
                    Summoning {persona.street_name}...
                  </span>
                </div>
              </div>
            )}

            {isError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Live transcript panel */}
          <div className="flex h-32 flex-col gap-1 overflow-y-auto rounded-lg border border-border/50 bg-card/50 p-2 no-scrollbar sm:h-auto sm:w-64">
            {userTranscript && (
              <div className="rounded-md bg-muted/50 p-2">
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                  You
                </span>
                <p className="text-[11px] leading-relaxed text-foreground">{userTranscript}</p>
              </div>
            )}
            {aiTranscript && (
              <div className="rounded-md bg-primary/10 p-2">
                <span className="text-[8px] uppercase tracking-wider text-primary">
                  {persona.street_name}
                </span>
                <p className="text-[11px] leading-relaxed text-foreground">{aiTranscript}</p>
              </div>
            )}
            {!userTranscript && !aiTranscript && (
              <div className="flex h-full items-center justify-center">
                <span className="text-[10px] text-muted-foreground">
                  {isConnecting ? "Waiting for connection..." : "Listening..."}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: pressure meter + controls */}
        <div className="border-t border-border/50 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pressure Cooker
              </span>
              {pressure > 70 && (
                <Badge
                  variant="destructive"
                  className="text-[8px]"
                  style={{ animation: "flicker 0.3s ease-in-out infinite" }}
                >
                  TALK OR CHOKE
                </Badge>
              )}
            </div>
            <span
              className={cn(
                "text-[9px] font-mono tabular-nums",
                pressure > 70 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {Math.floor(pressure)}%
            </span>
          </div>
          <Progress
            value={pressure}
            className={cn(
              "h-2",
              pressure > 70
                ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                : "[&_[data-slot=progress-indicator]]:bg-primary"
            )}
          />

          <div className="mt-3 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="border-border/50 bg-card"
            >
              {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleAbort}
              className="h-12 gap-2 rounded-full px-8 text-sm font-bold uppercase tracking-wider"
            >
              <PhoneOff className="h-5 w-5" />
              Abort
            </Button>

            <div className="w-9" />
          </div>
        </div>
      </div>
    </div>
  )
}
