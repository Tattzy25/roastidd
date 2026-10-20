import personasData from "@/data/personas.json"
import pricingData from "@/data/pricing.json"
import type { Persona, PricingTier } from "@/types"

export const personas: Persona[] = personasData as Persona[]
export const pricingTiers: PricingTier[] = pricingData as PricingTier[]
