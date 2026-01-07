export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Animated Loading Spinner */}
        <div className="relative w-16 h-16 mx-auto">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-muted" />
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          {/* Inner pulse */}
          <div className="absolute inset-3 rounded-full bg-primary/10 animate-pulse" />
        </div>

        {/* Loading Text */}
        <p className="text-muted-foreground text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

