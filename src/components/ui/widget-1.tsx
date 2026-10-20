import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export interface ApiUsageWidgetProps {
  title: string
  durationLabel: string
  price: string
  badgeText: string
  baseRoundLabel: string
  freeLabel: string
  description: string
  features: string[]
  progressValue: number
  buttonText?: string
  onAction?: () => void
  disabled?: boolean
}

export function ApiUsageWidget({
  title,
  durationLabel,
  price,
  badgeText,
  baseRoundLabel,
  freeLabel,
  description,
  features,
  progressValue,
  buttonText = "Get Roasted",
  onAction,
  disabled = false,
}: ApiUsageWidgetProps) {
  return (
    <div className="flex h-full w-full rounded-[28px] bg-muted p-1.5 sm:rounded-[34px] sm:p-2">
      <Card className="flex h-full w-full gap-0 rounded-[24px] border-border/60 bg-card/80 py-0 shadow-[0_0_28px_-18px_oklch(0.78_0.18_145)] ring-0 transition-colors hover:border-primary/40 sm:rounded-[28px]">
        <CardHeader className="gap-2 px-4 pt-5 pb-0 sm:px-5">
          <CardTitle className="min-w-0 truncate text-sm font-semibold text-muted-foreground">
            {title}
          </CardTitle>
          <CardAction>
            <Badge className="rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground shadow-[0px_0px_4px_1px_rgba(0,0,0,0.05),inset_0_0px_4px_1px_rgba(255,255,255,0.45),inset_0_1px_0px_0px_rgba(255,255,255,0.35)]">
              {badgeText}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col px-4 py-0 sm:px-5">
          <div className="mt-3 text-3xl font-black tracking-tight text-foreground tabular-nums sm:text-4xl">
            {durationLabel}
          </div>

          <Progress
            value={progressValue}
            aria-label={`${title} round length`}
            className="mt-3 h-1.5 w-full bg-muted **:data-[slot=progress-indicator]:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.7),inset_0_-2px_4px_0_rgba(0,0,0,0.2),0px_4px_24px_0px_rgba(0,0,0,0.1),0px_2px_12px_0px_rgba(0,0,0,0.1)]"
          />

          <div className="mt-3 flex min-w-0 flex-col gap-1 text-xs leading-relaxed sm:text-sm">
            <p className="truncate text-muted-foreground">{baseRoundLabel}</p>
            <p className="font-black uppercase text-primary">{freeLabel}</p>
            <p className="line-clamp-2 text-muted-foreground">{description}</p>
          </div>

          <ul className="mt-4 flex flex-col gap-1.5 text-sm">
            {features.map((feature) => (
              <li key={feature} className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="truncate">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="mt-auto px-4 pt-4 pb-5 sm:px-5">
          <Button
            type="button"
            onClick={onAction}
            disabled={disabled}
            aria-label={`${buttonText} for ${title} at ${price}`}
            className="h-12 w-full rounded-full bg-primary text-base font-black text-primary-foreground shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.7),inset_0_-2px_4px_0_rgba(0,0,0,0.2),0px_4px_24px_0px_rgba(0,0,0,0.1),0px_2px_12px_0px_rgba(0,0,0,0.1)] hover:bg-primary/90 dark:shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),inset_0_2px_4px_0_rgba(255,255,255,0.5)]"
            size="lg"
          >
            {buttonText} {price}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}