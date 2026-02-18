import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    title: "Conversational Lessons",
    description:
      "Practice Croatian through natural conversation with an AI tutor who adapts to your level and pace.",
    badge: "AI-Powered",
  },
  {
    title: "Adaptive Learning",
    description:
      "Lessons adjust in real-time based on your performance — harder when you're excelling, supportive when you're struggling.",
    badge: "Personalized",
  },
  {
    title: "Croatian Grammar",
    description:
      "Master 7 grammatical cases, verb aspects, and noun declensions with guided practice and gentle corrections.",
    badge: "Language-Specific",
  },
  {
    title: "Session Quizzes",
    description:
      "End each session with a short quiz that reinforces what you just learned, tracking your progress over time.",
    badge: "Retention",
  },
  {
    title: "CEFR-Aligned",
    description:
      "Content structured around the Common European Framework — from A1 basics to B2 fluency.",
    badge: "Standards",
  },
  {
    title: "Spaced Repetition",
    description:
      "Vocabulary review scheduled at optimal intervals so you remember what you learn.",
    badge: "Memory",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-24 text-center md:py-32">
          <Badge variant="secondary" className="text-sm">
            Currently in development
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Learn Croatian through{" "}
            <span className="text-primary/80">conversation</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Hrvatsk-AI pairs you with an AI tutor for personalized Croatian
            lessons. Practice speaking, build vocabulary, and master grammar —
            at your own pace.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start learning — free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/40 py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                How it works
              </h2>
              <p className="mt-3 text-muted-foreground">
                Each session is tailored to where you are in your learning
                journey.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="mb-2">
                      <Badge variant="outline">{feature.badge}</Badge>
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to start?
            </h2>
            <p className="text-muted-foreground">
              Create an account and have your first Croatian lesson in minutes.
              No credit card required.
            </p>
            <Button size="lg" asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
