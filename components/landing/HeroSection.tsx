import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-teal-50 to-white">
      <div className="container grid gap-8 md:grid-cols-2 md:gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your personal AI therapist, available anytime
          </h1>
          <p className="text-lg text-muted-foreground">
            SolaceHub provides compassionate AI-powered support for your mental
            health journey, with voice interactions, mood tracking, and
            personalized guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
            <img
              src="/placeholder.svg?height=600&width=800"
              alt="SolaceHub app interface showing a supportive conversation"
              className="w-full h-auto"
            />
          </div>
          <div className="absolute -z-10 top-8 right-8 w-full h-full bg-teal-200 rounded-lg"></div>
        </div>
      </div>
    </section>
  );
}
