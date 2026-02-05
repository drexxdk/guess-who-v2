import { Header } from "@/components/header";
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { Suspense } from "react";
import { LoadingProvider } from "@/lib/loading-context";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col relative">
        <Suspense fallback={<LoadingOverlay />}>
          <LoadingProvider>{children}</LoadingProvider>
        </Suspense>
      </div>
    </main>
  );
}
