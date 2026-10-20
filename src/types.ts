export interface Persona {
  id: string
  street_name: string
  system_message: string
  intensity: number
  tagline: string
  description: string
  avatar: string
  voice: string
  gender: "male" | "female"
  color: string
}

export interface PricingTier {
  id: string
  duration: number
  label: string
  sublabel: string
  price: number
  priceDisplay: string
  description: string
  modes: string[]
  languages: number
  badge: string | null
}

export type AppPhase = "loading" | "select" | "call"
