"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBuilder } from "../BuildProvider";
import { Input } from "@/components/ui/input";

// Safe localStorage access helper
const getLocalStorage = (key: string, defaultValue: any = "[]") => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) || defaultValue;
  }
  return defaultValue;
};

const SaveBuild: React.FC = () => {
  const { builder } = useBuilder();
  const [savedCodes, setSavedCodes] = useState<any[]>([]);
  const [name, setName] = useState("");

  // Initialize state after component mounts on client
  useEffect(() => {
    const saved = JSON.parse(getLocalStorage("vbuilds"));
    setSavedCodes(saved);
    setName(`Build ${saved.length + 1}`);
  }, []);

  const saveBuildCommand = async () => {
    const buildName = name || `Build ${savedCodes.length + 1}`;
    builder.send({ type: "SAVE_BUILD", name: buildName });
    try {
      toast("Build Saved", {
        className: "bg-black text-white",
        description: "Paste in-game chat to import.",
      });
    } catch (error) {
      toast.error("Failed to copy command");
    }
  };

  return (
    <div className="flex gap-4">
      <Input
        className="text-base bg-black/50 px-4 py-2 rounded-md border text-gray-400 flex-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button
        onClick={saveBuildCommand}
        className="px-3 py-2 text-white group border-red-900/70  bg-red-900/50 hover:bg-red-800 transition-colors"
      >
        SAVE
      </Button>
    </div>
  );
};

export default SaveBuild;
