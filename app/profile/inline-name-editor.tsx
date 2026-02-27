"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AuthorBadge } from "@/components/AuthorBadge";

interface InlineNameEditorProps {
  currentName?: string | null;
  badge?: {
    badgeType: string;
    description: string;
  } | null;
}

export default function InlineNameEditor({ currentName, badge }: InlineNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName || "");
  const [loading, setLoading] = useState(false);
  const { refetch } = useAuth();
  const router = useRouter();

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (trimmedName.length > 100) {
      toast.error("Name must be 100 characters or less");
      return;
    }

    // Don't update if name hasn't changed
    if (trimmedName === (currentName || "")) {
      setIsEditing(false);
      setName(currentName || "");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/profile/update-name", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update name");
      }

      toast.success("Name updated successfully!");
      setIsEditing(false);
      refetch(); // Update session state
      router.refresh(); // Refresh the page to show updated name
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update name";
      toast.error(errorMessage);
      setName(currentName || ""); // Reset to original value on error
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(currentName || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {badge && (
          <AuthorBadge
            badgeType={badge.badgeType}
            description={badge.description}
          />
        )}
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          maxLength={100}
          className="flex-1 min-w-[200px] bg-black/50 border-white/10 text-white placeholder:text-gray-500"
          autoFocus
        />
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={loading}
            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleCancel}
            disabled={loading}
            className="h-8 w-8 p-0 bg-gray-600 hover:bg-gray-700 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {badge && (
        <AuthorBadge
          badgeType={badge.badgeType}
          description={badge.description}
        />
      )}
      <span className="text-white">{currentName || "Not provided"}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 hover:bg-white/10 rounded transition-colors"
        aria-label="Edit name"
      >
        <Edit2 className="h-4 w-4 text-gray-400 hover:text-white" />
      </button>
    </div>
  );
}

