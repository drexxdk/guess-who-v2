import { AuthButton } from "@/components/auth-button";
import Link from "next/link";

interface HeaderProps {
  showAuth?: boolean;
}

export function Header({ showAuth = true }: HeaderProps) {
  return (
    <header className="bg-black h-header px-8 flex justify-center items-center sticky top-0 z-10">
      <div className="flex justify-between gap-2 items-center max-w-screen-lg w-full">
        <Link href="/">Guess Who</Link>
        {showAuth && <AuthButton />}
      </div>
    </header>
  );
}
