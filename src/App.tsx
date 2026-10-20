import { useState, useCallback } from "react"
import { PersonaCard } from "@/components/persona-card"
import { PricingDialog } from "@/components/ui/pricing-dialog"
import { CallInterface } from "@/components/call-interface"
import { EndScreen } from "@/components/end-screen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Zap } from "lucide-react"
import { personas } from "@/data/roast"
import type { AppPhase, Persona, PricingTier } from "@/types"
import { cn } from "@/lib/utils"

type EndReason = "completed" | "aborted" | "choked"

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("select")
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [activeTier, setActiveTier] = useState<PricingTier | null>(null)
  const [activePersona, setActivePersona] = useState<Persona | null>(null)
  const [endReason, setEndReason] = useState<EndReason | null>(null)

  const handleSelectPersona = useCallback((persona: Persona) => {
    setSelectedPersona(persona)
  }, [])

  const handleOpenPricing = useCallback(() => {
    if (!selectedPersona) return
    setPricingOpen(true)
  }, [selectedPersona])

  const handleConfirmPurchase = useCallback(
    (tier: PricingTier, persona: Persona) => {
      setPricingOpen(false)
      setActiveTier(tier)
      setActivePersona(persona)
      setPhase("call")
    },
    []
  )

  const handleCallEnd = useCallback((reason: EndReason) => {
    setEndReason(reason)
    setActiveTier(null)
  }, [])

  const handleRetry = useCallback(() => {
    setEndReason(null)
    if (selectedPersona) {
      setPricingOpen(true)
    }
  }, [selectedPersona])

  const handleBackToStreet = useCallback(() => {
    setEndReason(null)
    setSelectedPersona(null)
    setActivePersona(null)
    setPhase("select")
  }, [])

  if (phase === "call" && activePersona && activeTier) {
    return (
      <>
        <CallInterface
          persona={activePersona}
          tier={activeTier}
          onEnd={handleCallEnd}
        />
        {endReason && (
          <EndScreen
            reason={endReason}
            persona={activePersona}
            onRetry={handleRetry}
            onBack={handleBackToStreet}
          />
        )}
      </>
    )
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background scanline">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.78 0.18 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 145) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "grid-fade 4s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, oklch(0.78 0.18 145) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col px-4 py-3 sm:px-6 sm:py-4">
        <header className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tighter text-primary sm:text-3xl">
              ROASTIDD
            </h1>
            <Badge
              variant="secondary"
              className="border-primary/30 bg-primary/10 text-[8px] font-bold text-primary"
            >
              21+
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span
              className="size-1.5 rounded-full bg-primary"
              style={{ animation: "flicker 1.5s ease-in-out infinite" }}
            />
            <span className="font-mono uppercase tracking-wider">Live</span>
          </div>
        </header>

        <div className="mb-2 text-center">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Turn your camera on.{" "}
            <span className="font-semibold text-foreground">Try to survive.</span>{" "}
            Real-time AI roasting. No mercy.
          </p>
        </div>

        <div className="mb-3 flex min-h-0 flex-1 flex-col">
          <div className="mb-1.5 flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pick Your Opponent
            </span>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 sm:gap-3">
            {personas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onSelect={handleSelectPersona}
                selected={selectedPersona?.id === persona.id}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={handleOpenPricing}
          disabled={!selectedPersona}
          size="lg"
          className={cn(
            "h-12 gap-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all",
            selectedPersona
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Zap className="h-4 w-4" />
          {selectedPersona
            ? `Step Up to ${selectedPersona.street_name}`
            : "Pick a Roaster First"}
        </Button>
      </div>

      <PricingDialog
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        selectedPersona={selectedPersona}
        onConfirmPurchase={handleConfirmPurchase}
      />

      {endReason && activePersona && (
        <EndScreen
          reason={endReason}
          persona={activePersona}
          onRetry={handleRetry}
          onBack={handleBackToStreet}
        />
      )}
    </div>
  )
}