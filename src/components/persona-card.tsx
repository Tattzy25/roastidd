import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Zap, Check } from "lucide-react"
import type { Persona } from "@/types"
import { cn } from "@/lib/utils"

interface PersonaCardProps {
  persona: Persona
  onSelect: (persona: Persona) => void
  selected: boolean
  disabled?: boolean
}

export function PersonaCard({ persona, onSelect, selected, disabled = false }: PersonaCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Card
      className={cn(
        "group relative h-full min-h-0 overflow-hidden border-border/50 bg-card transition-all duration-300",
        disabled ? "cursor-not-allowed opacity-45 grayscale" : "cursor-pointer hover:border-primary/60 hover:shadow-[0_0_24px_-4px_oklch(0.78_0.18_145/0.3)]",
        selected && "border-primary ring-2 ring-primary shadow-[0_0_24px_-2px_oklch(0.78_0.18_145/0.5)]",
        hovered && !selected && !disabled && "scale-[1.02] border-primary/40",
        selected && hovered && !disabled && "scale-[1.02]"
      )}
      onClick={() => {
        if (!disabled) onSelect(persona)
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={persona.avatar}
        alt={persona.street_name}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-transform duration-500",
          !disabled && "group-hover:scale-105"
        )}
        style={{ filter: hovered && !disabled ? "contrast(1.1) saturate(1.1)" : "contrast(1) saturate(0.9)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2 sm:p-3">
        <Badge
          variant="secondary"
          className="border-primary/30 bg-background/60 backdrop-blur-sm"
        >
          <Flame className="mr-1 h-3 w-3 text-primary" />
          {persona.intensity}/10
        </Badge>
        {selected && (
          <div className="flex size-5 items-center justify-center rounded-full bg-primary">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-0.5 p-2 sm:space-y-1 sm:p-3">
        <h3 className="text-sm font-black tracking-tight text-foreground sm:text-xl">
          {persona.street_name}
        </h3>
        <span className="text-[8px] font-medium uppercase tracking-widest text-primary sm:text-[10px]">
          {persona.tagline}
        </span>
        <p className="hidden line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:block">
          {persona.description}
        </p>
        <div
          className={cn(
            "flex items-center gap-1.5 transition-opacity duration-300",
            selected || hovered ? "opacity-100" : "opacity-40"
          )}
        >
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-semibold uppercase tracking-wider text-primary sm:text-[10px]">
            {selected ? "Selected" : "Tap to Roast"}
          </span>
        </div>
      </div>
    </Card>
  )
}
