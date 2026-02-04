import { AuthButton } from "@/components/auth-button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="bg-black p-2 flex justify-center sticky top-0">
        <div className="flex justify-between gap-2 items-center max-w-screen-lg w-full">
          <Link href={"/"}>Guess Who</Link>
          <AuthButton />
        </div>
      </header>
      <div className="flex-grow flex flex-col">
        <div className="py-8 px-2">
          <div className="w-full mx-auto max-w-screen-lg">
            <Breadcrumbs />
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
