import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Skull, Trophy } from "lucide-react"
import type { Persona } from "@/types"
import { cn } from "@/lib/utils"

interface EndScreenProps {
  reason: "completed" | "aborted" | "choked"
  persona: Persona
  onRetry: () => void
  onBack: () => void
}

export function EndScreen({ reason, persona, onRetry, onBack }: EndScreenProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const config = {
    completed: {
      icon: Trophy,
      title: "YOU SURVIVED",
      subtitle: `Barely. ${persona.street_name} still thinks you're soft.`,
      color: "text-primary",
    },
    aborted: {
      icon: RotateCcw,
      title: "YOU TAPPED OUT",
      subtitle: `${persona.street_name} is laughing. You ran before it got good.`,
      color: "text-muted-foreground",
    },
    choked: {
      icon: Skull,
      title: "YOU CHOKED",
      subtitle: `${persona.street_name} slammed the phone in your face. Silence killed you.`,
      color: "text-destructive",
    },
  }[reason]

  const Icon = config.icon

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background scanline transition-opacity duration-500",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.78 0.18 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 145) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <div
          className={cn("transition-transform duration-700", visible ? "scale-100" : "scale-50")}
        >
          <Icon className={cn("h-16 w-16", config.color)} />
        </div>

        <div className="text-center">
          <h1
            className={cn(
              "text-4xl font-black tracking-tighter sm:text-6xl",
              config.color
            )}
          >
            {config.title}
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            {config.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={onRetry}
            size="lg"
            className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Go Another Round
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="gap-2 rounded-full border-border/50"
          >
            Back to the Street
          </Button>
        </div>
      </div>
    </div>
  )
}
