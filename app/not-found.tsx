import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Display */}
        <div className="relative">
          <h1 className="text-[120px] sm:text-[150px] font-bold text-foreground/5 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-junge)]">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for has vanished into the shadows.
            Perhaps it never existed, or the vampire lords have hidden it away.
          </p>
        </div>

        {/* Action Button */}
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </Button>

        {/* Decorative elements */}
        <div className="pt-8 text-xs text-muted-foreground/40">
          Lost in the darkness? The home page awaits.
        </div>
      </div>
    </div>
  );
}

