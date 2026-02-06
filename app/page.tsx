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
            Test your memory and have fun with friends!
          </p>
          <p className="text-base sm:text-lg text-white/80 mb-8 md:mb-12 max-w-xl px-4">
            A multiplayer guessing game where you identify people from photos.
            Create custom groups, host games, and compete for the highest score.
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
                Multiplayer
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
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                Fast-paced
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
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Fun
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
              Simple, fast, and fun. Get started in seconds.
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
