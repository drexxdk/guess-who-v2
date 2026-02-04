import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      {/* <div className="flex justify-end">
        <AuthButton />
      </div> */}
      <header className="bg-black p-2 flex justify-center sticky top-0 z-10">
        <div className="flex justify-between gap-2 items-center max-w-screen-lg w-full">
          <Link href={"/"}>Guess Who</Link>
          <AuthButton />
        </div>
      </header>
      <Suspense>{children}</Suspense>
    </main>
  );
}
