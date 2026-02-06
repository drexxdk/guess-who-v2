import { Header } from "@/components/header";
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { Suspense } from "react";
import { LoadingProvider } from "@/lib/loading-context";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex flex-col relative overflow-auto">
        <Suspense fallback={<LoadingOverlay />}>
          <LoadingProvider>
            <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>
          </LoadingProvider>
        </Suspense>
      </div>
    </main>
  );
}
