import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@/components/ui/dialog"
import { Pricing5, type PricingPlan } from "@/components/ui/pricing-5"
import type { Persona, PricingTier } from "@/types"
import pricingData from "@/data/pricing.json"
import { XIcon } from "lucide-react"

interface PricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPersona: Persona | null
  onConfirmPurchase: (tier: any, persona: Persona) => void
}

export function PricingDialog({
  open,
  onOpenChange,
}: PricingDialogProps) {
  const pricingTiers: PricingTier[] = pricingData
  const plans: PricingPlan[] = pricingTiers.map((tier) => ({
    id: tier.id,
    name: tier.label,
    description: `${tier.duration}`,
    monthlyPrice: tier.priceDisplay,
    yearlyPrice: tier.priceDisplay,
    currency: "",
    features: tier.features.map((name) => ({ name })),
    buttonText: tier.buttonText,
    isPopular: tier.isPopular,
    badge:
      tier.badge === "Solo" || tier.badge === "Whole Gang"
        ? undefined
        : tier.badge ?? undefined,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/50 backdrop-blur-xl"
        className="flex h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col gap-0 overflow-hidden border-border/50 bg-transparent p-0 sm:max-w-6xl lg:h-[min(700px,calc(100svh-2rem))] lg:w-[min(1000px,calc(100vw-2rem))]"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-0">
          <div className="my-auto w-full">
            <Pricing5
              heading=""
              subheading=""
              monthlyLabel=""
              yearlyLabel=""
              plans={plans}
            />
          </div>
        </div>
      </DialogContent>
      <DialogClose className="fixed top-4 right-4 z-50 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden">
        <XIcon className="size-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
    </Dialog>
  )
}