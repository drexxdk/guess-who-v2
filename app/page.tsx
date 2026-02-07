import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FaUserGroup, FaGraduationCap, FaHeart, FaPlus, FaCircleQuestion, FaTrophy } from 'react-icons/fa6';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
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
          <div className="absolute top-20 left-10 size-72 animate-pulse rounded-full bg-white blur-3xl" />
          <div className="absolute right-10 bottom-20 size-96 animate-pulse rounded-full bg-white blur-3xl delay-1000" />
        </div>

        <div className="relative container mx-auto flex min-h-[500px] flex-col items-center justify-center gap-8 px-4 py-12 text-center md:min-h-[600px] md:gap-12 md:py-20">
          {/* Logo */}
          <div className="scale-125 md:scale-150">
            <Logo showText={false} href="/" />
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-3 md:gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-7xl">Guess Who?</h1>
            <p className="max-w-2xl px-4 text-lg text-white/90 sm:text-xl md:text-2xl">
              Get to know each other through fun and games!
            </p>
            <p className="max-w-xl px-4 text-base text-white/80 sm:text-lg">
              A social icebreaker game that helps people learn about each other. Perfect for new employees, students,
              team building, and social events.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex w-full max-w-md flex-col gap-3 px-4 sm:flex-row md:gap-4">
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
              <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white hover:bg-white/30">
                <Icon icon={FaUserGroup} size="sm" color="white" />
                Social
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white hover:bg-white/30">
                <Icon icon={FaGraduationCap} size="sm" color="white" />
                Learning
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white hover:bg-white/30">
                <Icon icon={FaHeart} size="sm" color="white" />
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
            <div className="flex flex-col gap-3 md:gap-4">
              <h2 className="text-gradient-primary text-3xl font-bold sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Break the ice and build connections. Get started in seconds.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
            {/* Feature 1 */}
            <Card className="text-center transition-transform hover:scale-105">
              <CardHeader className="flex flex-col gap-4">
                <div className="bg-gradient-primary glow-primary flex size-16 items-center justify-center self-center rounded-2xl">
                  <Icon icon={FaPlus} size="xl" color="white" />
                </div>
                <CardTitle>Create or Join</CardTitle>
                <CardDescription>
                  Host a game with your custom photo groups or join an existing game with a simple code
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center transition-transform hover:scale-105">
              <CardHeader className="flex flex-col gap-4">
                <div className="glow-accent flex size-16 items-center justify-center self-center rounded-2xl bg-gradient-to-br from-[hsl(217_91%_60%)] to-[hsl(340_82%_52%)]">
                  <Icon icon={FaCircleQuestion} size="xl" color="white" />
                </div>
                <CardTitle>Guess the Person</CardTitle>
                <CardDescription>
                  Look at a photo and choose the correct name from multiple choice options
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center transition-transform hover:scale-105">
              <CardHeader className="flex flex-col gap-4">
                <div className="glow-success flex size-16 items-center justify-center self-center rounded-2xl bg-[hsl(142_76%_36%)]">
                  <Icon icon={FaTrophy} size="xl" color="white" />
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
              <CardContent className="flex flex-col gap-4 py-12 md:gap-8">
                <h3 className="text-3xl font-bold">Ready to Connect?</h3>
                <p className="text-muted-foreground text-lg">
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
        <div className="text-muted-foreground container mx-auto flex max-w-6xl flex-col gap-2 text-center">
          <p>© 2026 Guess Who Game. All rights reserved.</p>
          <p className="text-sm">Built with Next.js, Supabase, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
