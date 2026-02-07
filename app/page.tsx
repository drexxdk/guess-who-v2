import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 overflow-hidden bg-gradient-to-br from-[hsl(262_83%_58%)] via-[hsl(217_91%_60%)] to-[hsl(340_82%_52%)]">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-white blur-3xl" />
          <div className="absolute right-10 bottom-20 h-96 w-96 animate-pulse rounded-full bg-white blur-3xl delay-1000" />
        </div>

        <div className="relative container mx-auto flex min-h-[500px] flex-col items-center justify-center px-4 py-12 text-center md:min-h-[600px] md:py-20">
          {/* Logo */}
          <div className="mb-6 scale-125 md:mb-8 md:scale-150">
            <Logo showText={false} href="/" />
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:mb-6 md:text-7xl">
            Guess Who?
          </h1>
          <p className="mb-3 max-w-2xl px-4 text-lg text-white/90 sm:text-xl md:mb-4 md:text-2xl">
            Get to know each other through fun and games!
          </p>
          <p className="mb-8 max-w-xl px-4 text-base text-white/80 sm:text-lg md:mb-12">
            A social icebreaker game that helps people learn about each other. Perfect for new employees, students, team
            building, and social events.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex w-full max-w-md flex-col gap-3 px-4 sm:flex-row md:mb-16 md:gap-4">
            <Link
              href="/game/join"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'text-primary w-full bg-white px-6 py-5 text-base hover:scale-105 hover:bg-white/90 sm:w-auto md:px-8 md:py-6 md:text-lg',
              )}
            >
              Join Game
            </Link>
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'hover:text-primary w-full border-2 border-white px-6 py-5 text-base text-white hover:bg-white sm:w-auto md:px-8 md:py-6 md:text-lg',
              )}
            >
              Host a Game
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 px-4 text-white/90 md:gap-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Social
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Learning
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                Icebreaker
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background px-4 py-12 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="text-gradient-primary mb-3 text-3xl font-bold sm:text-4xl md:mb-4 md:text-5xl">
              How It Works
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl px-4 text-base md:text-lg">
              Break the ice and build connections. Get started in seconds.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
            {/* Feature 1 */}
            <Card className="text-center transition-transform hover:scale-105">
              <CardHeader>
                <div className="bg-gradient-primary glow-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <CardTitle>Create or Join</CardTitle>
                <CardDescription>
                  Host a game with your custom photo groups or join an existing game with a simple code
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center transition-transform hover:scale-105">
              <CardHeader>
                <div className="glow-accent mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(217_91%_60%)] to-[hsl(340_82%_52%)]">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  Look at a photo and choose the correct name from multiple choice options
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center transition-transform hover:scale-105">
              <CardHeader>
                <div className="glow-success mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(142_76%_36%)]">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  Race against time and compete for the highest score. See who knows everyone best!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Additional CTA */}
          <div className="mt-16 text-center">
            <Card className="border-primary/50 mx-auto max-w-3xl bg-gradient-to-br from-[hsl(240_10%_8%)] to-[hsl(240_10%_4%)]">
              <CardContent className="py-12">
                <h3 className="mb-4 text-3xl font-bold">Ready to Connect?</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Join others in a fun, engaging way to learn names and faces
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Link href="/game/join" className={buttonVariants({ size: 'lg' })}>
                    Join Game Now
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className={buttonVariants({
                      size: 'lg',
                      variant: 'outline',
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
      <footer className="border-border bg-card border-t px-4 py-8">
        <div className="text-muted-foreground container mx-auto max-w-6xl text-center">
          <p className="mb-2">© 2026 Guess Who Game. All rights reserved.</p>
          <p className="text-sm">Built with Next.js, Supabase, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
