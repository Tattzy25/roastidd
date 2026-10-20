import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ApiUsageWidget } from "@/components/ui/widget-1"
import type { Persona, PricingTier } from "@/types"
import { pricingTiers } from "@/data/roast"

type PackDetails = {
  title: string
  baseRoundLabel: string
  freeLabel: string
  description: string
  badgeText: string
}

const PACK_DETAILS: Record<string, PackDetails> = {
  taste: {
    title: "Quick Warmup",
    baseRoundLabel: "90sec base round",
    freeLabel: "30sec FREE",
    description: "Quick taste. Try not to quit early.",
    badgeText: "Solo",
  },
  standard: {
    title: "Ego Check",
    baseRoundLabel: "240sec base round",
    freeLabel: "60sec FREE",
    description: "Five minutes of pure heat.",
    badgeText: "Solo",
  },
  extended: {
    title: "Sweat Session",
    baseRoundLabel: "420sec base round",
    freeLabel: "180sec FREE",
    description: "Long enough to start sweating.",
    badgeText: "Solo",
  },
  marathon: {
    title: "The Solo Marathon",
    baseRoundLabel: "900sec base round",
    freeLabel: "300sec FREE",
    description: "If you survive this, you have no shame.",
    badgeText: "Solo",
  },
  duo: {
    title: "Tag-Team Mode",
    baseRoundLabel: "1200sec base round",
    freeLabel: "300sec FREE",
    description: "Bring a friend. It won’t help you.",
    badgeText: "2-Person",
  },
  crew: {
    title: "Whole Crew Mode",
    baseRoundLabel: "1350sec base round",
    freeLabel: "450sec FREE",
    description: "Prop the phone up. Everybody gets smoked.",
    badgeText: "Whole Gang",
  },
}

interface PricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPersona: Persona | null
  onConfirmPurchase: (tier: PricingTier, persona: Persona) => void
}

export function PricingDialog({
  open,
  onOpenChange,
  selectedPersona,
  onConfirmPurchase,
}: PricingDialogProps) {
  function handleChooseRound(tier: PricingTier) {
    if (!selectedPersona) return
    onConfirmPurchase(tier, selectedPersona)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100svh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-none flex-col gap-0 overflow-hidden border-border/50 bg-background/95 p-0 sm:max-w-6xl lg:h-[min(760px,calc(100svh-1.5rem))]">
        <DialogHeader className="flex-none gap-1 border-b border-border/50 px-5 py-3">
          <div className="flex items-center justify-between gap-4 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-xl font-black tracking-tight text-pretty">
                CHOOSE YOUR ROUND
              </DialogTitle>
              <DialogDescription className="truncate text-xs text-muted-foreground">
                {selectedPersona ? (
                  <>
                    Roaster:{" "}
                    <span className="font-semibold text-primary">
                      {selectedPersona.street_name}
                    </span>
                  </>
                ) : (
                  "Choose a round."
                )}
              </DialogDescription>
            </div>
            {selectedPersona && (
              <img
                src={selectedPersona.avatar}
                alt={selectedPersona.street_name}
                width={40}
                height={40}
                className="size-10 rounded-md object-cover ring-1 ring-primary/40"
              />
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 overscroll-contain">
          <div className="grid auto-rows-fr gap-3 p-4 sm:grid-cols-2 lg:h-full lg:grid-cols-3 lg:grid-rows-2 lg:gap-3 lg:p-4">
            {pricingTiers.map((tier) => (
              <RoastPackCard
                key={tier.id}
                tier={tier}
                onChoose={() => handleChooseRound(tier)}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface RoastPackCardProps {
  tier: PricingTier
  onChoose: () => void
}

function RoastPackCard({ tier, onChoose }: RoastPackCardProps) {
  const details = PACK_DETAILS[tier.id]
  const primaryMode = details?.badgeText ?? tier.modes[0] ?? "Solo"
  const languageLabel = tier.languages === 1 ? "1 language" : `${tier.languages} languages`
  const progressValue = Math.max(18, Math.min(100, Math.round((tier.duration / 1800) * 100)))

  return (
    <ApiUsageWidget
      title={details?.title ?? tier.label}
      durationLabel={`${tier.duration}sec`}
      price={tier.priceDisplay}
      badgeText={primaryMode}
      baseRoundLabel={details?.baseRoundLabel ?? tier.sublabel}
      freeLabel={details?.freeLabel ?? "Bonus Time Included"}
      description={details?.description ?? tier.description}
      progressValue={progressValue}
      buttonText="Get Roasted"
      onAction={onChoose}
      features={[
        primaryMode,
        languageLabel,
        "Camera + mic live roast",
      ]}
    />
  )
}