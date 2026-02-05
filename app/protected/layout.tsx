import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { Suspense } from "react";
import { LoadingProvider } from "@/lib/loading-context";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col relative">
        <LoadingProvider>
          <div className="p-8">
            <div className="w-full mx-auto max-w-screen-lg">
              <Breadcrumbs />
              <Suspense fallback={<LoadingOverlay />}>{children}</Suspense>
            </div>
          </div>
        </LoadingProvider>
      </div>
    </main>
  );
}
