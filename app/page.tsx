"use client"

import Link from "next/link"
import { Leaf, Shield, MapPin, Camera, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <Leaf className="h-4 w-4" /> Environmental Reporting Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-heading leading-tight">
              Report Environmental Issues in
              <span className="text-primary block mt-2">Your Community</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Take action by reporting pollution, waste, deforestation, and other environmental hazards.
              Track progress as authorities investigate and resolve each report.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button size="lg" asChild className="rounded-full text-base px-8 shadow-lg shadow-primary/20">
                <Link href={isAuthenticated ? "/reports/create" : "/register"}>
                  {isAuthenticated ? "Report an Issue" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full text-base px-8">
                <Link href="/reports/public">
                  View Reports
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-center mb-4">How It Works</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">
            Three simple steps to make a difference in your community.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Camera, title: "Snap a Photo", desc: "Take a picture of the environmental issue you've spotted in your area." },
              { icon: MapPin, title: "Pin the Location", desc: "Mark the exact location on the map so authorities can find it quickly." },
              { icon: Shield, title: "Track Progress", desc: "Follow your report as it moves through review, investigation, and resolution." },
            ].map((step, i) => (
              <Card key={i} className="rounded-2xl border border-border/50 p-8 text-center hover:shadow-lg hover:shadow-primary/5 transition-all">
                <div className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">Categories We Track</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            From illegal dumping to deforestation, we cover all types of environmental concerns.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {[
              "Illegal Dumping", "Overflowing Waste", "Air Pollution",
              "Water Contamination", "Noise Pollution", "Deforestation",
              "Bad Roads", "Other Issues",
            ].map((cat) => (
              <span key={cat} className="rounded-full bg-background border border-border/50 px-4 py-2 text-sm font-medium hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-10 md:p-16 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground font-heading mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Join your community in reporting and resolving environmental issues. Every report counts.
            </p>
            <Button size="lg" variant="secondary" asChild className="rounded-full text-base px-8 shadow-lg">
              <Link href={isAuthenticated ? "/reports/create" : "/register"}>
                {isAuthenticated ? "Report an Issue" : "Create Your Account"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
