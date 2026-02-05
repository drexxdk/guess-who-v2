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
      <header className="bg-black py-2 px-8 flex justify-center sticky top-0 z-10">
        <div className="flex justify-between gap-2 items-center max-w-screen-lg w-full">
          <Link href={"/"}>Guess Who</Link>
          <AuthButton />
        </div>
      </header>
      <div className="flex-grow flex flex-col relative">
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          {children}
        </Suspense>
      </div>
    </main>
  );
}
