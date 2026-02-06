import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/protected");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 relative overflow-hidden bg-gradient-to-br from-[hsl(262_83%_58%)] via-[hsl(217_91%_60%)] to-[hsl(340_82%_52%)]">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative container mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px] text-center">
          {/* Logo */}
          <div className="mb-6 md:mb-8 scale-125 md:scale-150">
            <Logo showText={false} href="/" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 md:mb-6 tracking-tight">
            Guess Who?
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-3 md:mb-4 max-w-2xl px-4">
            Get to know each other through fun and games!
          </p>
          <p className="text-base sm:text-lg text-white/80 mb-8 md:mb-12 max-w-xl px-4">
            A social icebreaker game that helps people learn about each other.
            Perfect for new employees, students, team building, and social events.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-12 md:mb-16 w-full max-w-md px-4">
            <Link
              href="/game/join"
              className={cn(
                buttonVariants({ size: "lg" }),
                "text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-white text-primary hover:bg-white/90 hover:scale-105 w-full sm:w-auto",
              )}
            >
              Join Game
            </Link>
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "text-base md:text-lg px-6 md:px-8 py-5 md:py-6 border-2 border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto",
              )}
            >
              Host a Game
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-white/90 px-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Social
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                Learning
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Icebreaker
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-gradient-primary">
              How It Works
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Break the ice and build connections. Get started in seconds.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <Card className="text-center hover:scale-105 transition-transform">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 glow-primary">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <CardTitle>Create or Join</CardTitle>
                <CardDescription>
                  Host a game with your custom photo groups or join an existing
                  game with a simple code
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center hover:scale-105 transition-transform">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[hsl(217_91%_60%)] to-[hsl(340_82%_52%)] rounded-2xl flex items-center justify-center mb-4 glow-accent">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle>Guess the Person</CardTitle>
                <CardDescription>
                  Look at a photo and choose the correct name from multiple
                  choice options
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center hover:scale-105 transition-transform">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-[hsl(142_76%_36%)] rounded-2xl flex items-center justify-center mb-4 glow-success">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <CardTitle>Compete & Win</CardTitle>
                <CardDescription>
                  Race against time and compete for the highest score. See who
                  knows everyone best!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Additional CTA */}
          <div className="text-center mt-16">
            <Card className="max-w-3xl mx-auto bg-gradient-to-br from-[hsl(240_10%_8%)] to-[hsl(240_10%_4%)] border-primary/50">
              <CardContent className="py-12">
                <h3 className="text-3xl font-bold mb-4">Ready to Play?</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Join thousands of players having fun testing their memory
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/game/join"
                    className={buttonVariants({ size: "lg" })}
                  >
                    Join Game Now
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className={buttonVariants({
                      size: "lg",
                      variant: "outline",
                    })}
                  >
                    Create Account
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-card">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p className="mb-2">© 2026 Guess Who Game. All rights reserved.</p>
          <p className="text-sm">
            Built with Next.js, Supabase, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
