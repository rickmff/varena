"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/better-auth/client";

interface DeleteAccountButtonProps {
  userEmail: string;
}

export default function DeleteAccountButton({ userEmail }: DeleteAccountButtonProps) {
  const [loading, setLoading] = useState(false);
  const [emailConfirm, setEmailConfirm] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (emailConfirm !== userEmail) {
      toast.error("Email confirmation does not match. Please enter your email address correctly.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gdpr/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmEmail: emailConfirm }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success("Your account and all data have been permanently deleted.");

      // Sign out and redirect
      await authClient.signOut();
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full justify-start bg-red-950/50 hover:bg-red-900/50 border-red-800/50 text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete My Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black border-[#5865F2]/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl">
            Delete Account Permanently
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This action cannot be undone. This will permanently delete your account and all associated data including:
          </AlertDialogDescription>
          <ul className="list-disc list-inside mt-3 text-sm text-gray-400 space-y-1 ml-4">
            <li>Your profile information</li>
            <li>All your builds</li>
            <li>All your votes</li>
            <li>All your sessions</li>
            <li>All linked accounts</li>
          </ul>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="email-confirm" className="text-white text-sm">
            To confirm, please type your email address: <span className="text-gray-500">{userEmail}</span>
          </Label>
          <Input
            id="email-confirm"
            type="email"
            placeholder="Enter your email"
            value={emailConfirm}
            onChange={(e) => setEmailConfirm(e.target.value)}
            className="mt-2 bg-[#0f0a47] border-[#5865F2]/50 text-white"
            disabled={loading}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="bg-[#0f0a47] hover:bg-[#1a1a5e] border-[#5865F2]/50 text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || emailConfirm !== userEmail}
            className="bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-300"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account Permanently"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

