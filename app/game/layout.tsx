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
      <header className="bg-black p-2 flex justify-center sticky top-0">
        <div className="flex justify-between gap-2 items-center max-w-screen-lg w-full">
          <Link href={"/"}>Guess Who</Link>
          <AuthButton />
        </div>
      </header>
      <div className="grow flex flex-col gap-2 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
        <Suspense>{children}</Suspense>
      </div>
    </main>
  );
}
