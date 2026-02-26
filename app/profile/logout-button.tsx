"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/better-auth/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function LogoutButton() {
  const router = useRouter();
  const { refetch } = useAuth();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully!");
      refetch(); // Update session state
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error signing out");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="w-full justify-start bg-red-950/20 hover:bg-red-950/40 border-red-800 text-red-400 hover:text-red-300"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  );
}

