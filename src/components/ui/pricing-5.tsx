import { useState } from "react";
import { MdCheckCircle } from "react-icons/md";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PricingFeature {
  name: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  currency: string;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  isPopular?: boolean;
  badge?: string;
}

export interface Pricing5Props {
  heading: string;
  subheading: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
  plans: PricingPlan[];
}

export function Pricing5({
  heading,
  subheading,
  monthlyLabel = "Bill Monthly",
  yearlyLabel = "Bill Yearly",
  plans,
}: Pricing5Props) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="w-full">
      <div className="w-full">
        {heading && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {heading}
            </h2>
            <p className="text-muted-foreground max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {subheading}
            </p>
          </div>
        )}

        {(monthlyLabel || yearlyLabel) && (
          <div className="mt-10 flex items-center justify-center space-x-4">
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer text-sm font-medium transition-colors",
                !isYearly ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {monthlyLabel}
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer text-sm font-medium transition-colors",
                isYearly ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {yearlyLabel}
            </Label>
          </div>
        )}

        <div className="grid w-full grid-cols-1 gap-[5px] bg-transparent min-[431px]:max-[750px]:grid-cols-2 min-[751px]:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-[2rem] border p-[2px] transition-all duration-200 sm:p-[2px]",
                plan.isPopular
                  ? "border-black bg-primary shadow-[0_12px_24px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_2px_0_0px_rgba(255,255,255,0.5)]"
                  : "border-[#ffffff] bg-[#2a2a2a] shadow-[0_12px_24px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_2px_0_0px_rgba(255,255,255,0.15)]",
              )}
            >
              <div className="mt-1 mb-2 px-4 sm:px-5">
                <div className="flex items-center justify-between">
                  <h3
                    className={cn(
                      "text-xl font-bold",
                      plan.isPopular
                        ? "text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <Badge
                      variant={plan.isPopular ? "secondary" : "default"}
                      className="rounded-full"
                    >
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-2xl font-extrabold flex items-baseline gap-1",
                    plan.isPopular
                      ? "text-primary-foreground"
                      : "text-primary",
                  )}
                >
                  {plan.description}
                  <span className="text-lg font-bold lowercase">sec</span>
                </p>
              </div>

              <div className="bg-card flex flex-1 flex-col rounded-4xl p-3 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.08)] sm:p-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-card-foreground text-2xl font-extrabold">
                    {plan.currency}
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                </div>

                <ul className="mt-3 flex-1 space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <MdCheckCircle
                        className={cn(
                          "size-4 shrink-0",
                          plan.isPopular
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                      <span className="text-card-foreground text-xs">
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "] mt-4 h-10 w-full rounded-xl border text-xs font-semibold",
                    plan.isPopular
                      ? "border-primary shadow-[0px_0px_4px_1px_rgba(0,0,0,0.05),inset_0_0px_4px_1px_rgba(255,255,255,0.45),inset_0_1px_0px_0px_rgba(255,255,255,0.35)]"
                      : "border-border shadow-[0px_0px_4px_1px_rgba(0,0,0,0.05),inset_0_0px_4px_1px_rgba(255,255,255,0.15),inset_0_1px_0px_0px_rgba(255,255,255,0.1)]",
                  )}
                  variant={
                    plan.buttonVariant ||
                    (plan.isPopular ? "default" : "secondary")
                  }
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}