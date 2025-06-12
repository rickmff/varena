import React, { useEffect, MouseEvent } from "react";
import { useBuilder } from "../BuildProvider";
import { arenaCode } from "@/components/machines/converter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export const SearchParamsBuildCodeUpdater = () => {
  const { state } = useBuilder();
  const searchParams = useSearchParams();
  const code = arenaCode(state.context);

  useEffect(() => {
    if (code) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("build", code);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }
  }, [code, searchParams]);
  return null;
};

const ArenaCode: React.FC = () => {
  const { state } = useBuilder();

  const exportCommand = `.import-build ${arenaCode(state.context)}`;

  const copyBuildCommand = async () => {
    try {
      await navigator.clipboard.writeText(exportCommand);
      toast("Build Command Copied", {
        className: "bg-black text-white",
        description: "Paste in-game chat to import.",
      });
    } catch (error) {
      toast.error("Failed to copy command");
    }
  };

  return (
    <div className="flex gap-4">
      <input
        readOnly
        className="text-base bg-black/50 px-4 py-2 rounded-md border w-3/4 text-center text-gray-400"
        value={exportCommand}
      />
      <Button
        onClick={copyBuildCommand}
        className="px-3 py-2 text-white group border-red-900/70  bg-red-900/50 hover:bg-red-800 transition-colors"
      >
        COPY COMMAND
      </Button>
    </div>
  );
};

export const ArenaCodeOutsideBuilder: React.FC<{
  code: string;
}> = ({ code }) => {
  const exportCommand = `.import-build ${code}`;

  const copyBuildCommand = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(exportCommand);
      toast("Build Command Copied", {
        className: "bg-black text-white",
        description: "Paste in-game chat to import.",
      });
    } catch (error) {
      toast.error("Failed to copy command");
    }
  };

  return (
    <div className="flex gap-4">
      <input
        onClick={(e: MouseEvent<HTMLInputElement>) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        readOnly
        className="text-base bg-black/50 px-4 py-2 rounded-md border w-3/4 text-center text-gray-400"
        value={exportCommand}
      />
      <Button
        onClick={copyBuildCommand}
        className="px-3 py-2 text-white group border-red-900/70  bg-red-900/50 hover:bg-red-800 transition-colors"
      >
        COPY COMMAND
      </Button>
    </div>
  );
};

export default ArenaCode;
