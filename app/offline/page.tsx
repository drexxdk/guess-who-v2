"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold text-foreground">
          You&apos;re Offline
        </h1>
        <p className="text-muted-foreground">
          It looks like you&apos;ve lost your internet connection. Please check
          your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
