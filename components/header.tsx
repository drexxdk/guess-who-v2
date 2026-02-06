import { AuthButton } from "@/components/auth-button";
import { Logo, LogoCompact } from "@/components/ui/logo";

interface HeaderProps {
  showAuth?: boolean;
}

export function Header({ showAuth = true }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[hsl(240_10%_4%)] via-[hsl(240_10%_6%)] to-[hsl(240_10%_4%)] h-header px-4 md:px-8 flex justify-center items-center sticky top-0 z-50 border-b border-border/50 backdrop-blur-sm">
      <div className="flex justify-between gap-4 items-center max-w-screen-lg w-full">
        {/* Show compact logo on mobile, full logo on desktop */}
        <div className="md:hidden">
          <LogoCompact />
        </div>
        <div className="hidden md:block">
          <Logo />
        </div>
        {showAuth && <AuthButton />}
      </div>
    </header>
  );
}
