import React from "react";
import { useBuilder } from "../BuildProvider";
import { arenaCode } from "@/components/machines/converter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ArenaCode: React.FC = () => {
  const { state } = useBuilder();
  const exportCommand = `.import-build ${arenaCode(state.context)}`;

  const copyBuildCommand = async () => {
    try {
      await navigator.clipboard.writeText(exportCommand);
      // toast.success(
      //   <>
      //     Build command copied! <br /> Paste in-game chat to import.
      //   </>
      // );

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
      {/* <input
        readOnly
        className="text-gray-300 text-base bg-black/50 bg-black px-4 py-2 rounded-md border w-3/4 text-center"
        value={exportCommand}
      /> */}
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
