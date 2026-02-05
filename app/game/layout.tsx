import { Header } from "@/components/header";
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { Suspense } from "react";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col relative">
        <Suspense fallback={<LoadingOverlay />}>{children}</Suspense>
      </div>
    </main>
  );
}
