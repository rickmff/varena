"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ClipboardCopyIcon } from "lucide-react";
import { toast } from "sonner";
import { convertStringToBuild } from "../machines/converter";
import bloodData from "@/data/vbuilds/bloodtypes.json";

type Build = {
  name: string;
  code: string;
};

const Img = ({ src, alt = "" }: { src: string | undefined; alt?: string }) => {
  return src ? <img src={src} className="w-6 h-6" alt={alt} /> : null;
};

const BuildContent = ({ code }: { code: string }) => {
  const build = convertStringToBuild(code);

  console.log(build.coatings);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <div>Armour</div>
          <div className="flex">
            <Img src={build.armour?.image} />
            <Img src={build.amulet?.image} />
          </div>
        </div>
        <div>
          <div>Buffs</div>

          <div className="flex">
            <Img src={build.elixir?.image} />
            {build.coatings &&
              Array.from(build.coatings.values()).map((coating, index) => {
                if (coating && coating.image) {
                  return (
                    <Img
                      key={index}
                      src={coating.image}
                      alt={`Coating ${index}`}
                    />
                  );
                }
                return null;
              })}
          </div>
        </div>
        <div>
          <div>Blood</div>
          <div className="flex">
            {build.blood?.primary && (
              <Img
                src={
                  bloodData[build.blood.primary as keyof typeof bloodData]
                    ?.image
                }
                alt={`Blood: ${build.blood.primary}`}
              />
            )}
            {build.blood?.secondary && (
              <Img
                src={
                  bloodData[build.blood.secondary as keyof typeof bloodData]
                    ?.image
                }
                alt={`Blood: ${build.blood.secondary}`}
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div>
          <div>Spells</div>
          <div className="flex gap-1">
            {build.spells.dash && (
              <Img src={build.spells.dash.img} alt="Veil" />
            )}
            {build.spells.spell1 && (
              <Img src={build.spells.spell1.img} alt="Spell 1" />
            )}
            {build.spells.spell2 && (
              <Img src={build.spells.spell2.img} alt="Spell 2" />
            )}
            {build.spells.ultimate && (
              <Img src={build.spells.ultimate.img} alt="Ultimate" />
            )}
          </div>
        </div>
        <div>
          <div>Passives</div>
          <div className="flex gap-1">
            {build.passives.map((passive) => (
              <Img src={passive.img} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <div>Weapons</div>
        <div className="flex gap-0.5">
          {Array.from(build.weapons.values()).map((weapon) => (
            <span className="bg-black">
              <Img src={weapon.img} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function BuildsList() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch builds from localStorage
    const fetchBuilds = () => {
      try {
        const storedBuilds = localStorage.getItem("vbuilds");
        if (storedBuilds) {
          const parsedBuilds = JSON.parse(storedBuilds);
          setBuilds(Array.isArray(parsedBuilds) ? parsedBuilds : []);
        }
      } catch (error) {
        console.error("Failed to load builds from localStorage:", error);
        setBuilds([]);
      }
    };

    fetchBuilds();
  }, []);

  const handleBuildClick = (code: string) => {
    router.push(`/builds/create?build=${encodeURIComponent(code)}`);
  };

  const handleDelete = (event: React.MouseEvent, index: number) => {
    // Prevent the card click event from triggering
    event.stopPropagation();

    // Remove the build at the specified index
    const updatedBuilds = [...builds];
    updatedBuilds.splice(index, 1);

    // Update state and localStorage
    setBuilds(updatedBuilds);
    try {
      localStorage.setItem("vbuilds", JSON.stringify(updatedBuilds));
    } catch (error) {
      console.error("Failed to update localStorage:", error);
    }
  };

  const handleCopyCommand = async (event: React.MouseEvent, code: string) => {
    event.stopPropagation();
    const command = `.import-build ${code}`;

    try {
      await navigator.clipboard.writeText(command);
      toast("Build Command Copied", {
        className: "bg-black text-white",
        description: "Paste in-game chat to import.",
      });
    } catch (error) {
      toast.error("Failed to copy command");
    }
  };

  if (builds.length === 0) {
    return (
      <p className="text-white text-center">
        No builds found. Create some builds to see them here!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {builds.map((build, index) => (
        <Card
          key={index}
          className="bg-gray-800 text-white border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors relative"
          onClick={() => handleBuildClick(build.code)}
        >
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
              onClick={(e) => handleCopyCommand(e, build.code)}
              aria-label="Copy build command"
            >
              <ClipboardCopyIcon size={14} />
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
              onClick={(e) => handleDelete(e, index)}
              aria-label="Delete build"
            >
              ×
            </button>
          </div>

          <CardHeader>
            <CardTitle>{build.name || "Unnamed Build"}</CardTitle>
          </CardHeader>
          <CardContent>
            <BuildContent code={build.code} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
