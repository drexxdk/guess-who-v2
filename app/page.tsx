import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FaUserGroup, FaGraduationCap, FaHeart, FaPlus, FaCircleQuestion, FaTrophy } from 'react-icons/fa6';
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
                <FaUserGroup className="mr-1 h-4 w-4" />
                Social
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <FaGraduationCap className="mr-1 h-4 w-4" />
                Learning
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <FaHeart className="mr-1 h-4 w-4" />
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
                  <FaPlus className="h-8 w-8 text-white" />
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
                  <FaCircleQuestion className="h-8 w-8 text-white" />
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
                  <FaTrophy className="h-8 w-8 text-white" />
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
