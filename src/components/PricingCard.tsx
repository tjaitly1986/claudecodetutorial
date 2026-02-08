import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    price: "$9",
    description: "Perfect for getting started",
    features: [
      "Up to 10 projects",
      "Basic analytics",
      "24/7 customer support",
      "1GB storage",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$29",
    description: "Best for professionals",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "10GB storage",
      "Custom domains",
      "Team collaboration",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom integrations",
      "Unlimited storage",
      "Advanced security",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
  },
]

export function PricingCard() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-lg text-muted-foreground">
          Select the perfect plan for your needs
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              "relative flex flex-col transition-all hover:shadow-lg",
              tier.popular &&
                "border-primary shadow-xl scale-105 md:scale-110"
            )}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="size-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={tier.popular ? "default" : "outline"}
              >
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
