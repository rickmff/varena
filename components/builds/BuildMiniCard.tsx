import Link from "next/link";
import { convertStringToBuild } from "@/components/machines/converter";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface BuildMiniCardProps {
  id: string;
  name: string;
  code: string;
  upvotes: number;
  downvotes: number;
}

export default function BuildMiniCard({ id, name, code, upvotes, downvotes }: BuildMiniCardProps) {
  let build;
  try {
    build = convertStringToBuild(code);
  } catch {
    return null;
  }

  const spells = build.spells;
  const spellImgs = [
    spells.dash?.img,
    spells.spell1?.img,
    spells.spell2?.img,
    spells.ultimate?.img,
  ];

  const primaryKey = build.blood?.primary as keyof typeof bloodData | undefined;
  const secondaryKey = build.blood?.secondary as keyof typeof bloodData | undefined;
  const bloods = [primaryKey, secondaryKey]
    .map((k) => (k ? bloodData[k] : null))
    .filter(Boolean) as (typeof bloodData)[keyof typeof bloodData][];

  const weapons = Array.from(build.weapons.values()).slice(0, 4);

  return (
    <Link
      href={`/builds/${id}`}
      className="group block rounded-sm bg-white/[0.03] hover:bg-[#8B0000]/10 border border-white/5 hover:border-[#8B0000]/30 transition-all overflow-hidden"
    >
      <div className="px-3 py-2.5 flex items-center justify-between gap-3">
        <span className="text-sm text-white/80 group-hover:text-white font-medium truncate">{name}</span>
        <div className="flex items-center gap-2.5 shrink-0 text-xs text-gray-600">
          <span className="flex items-center gap-1 text-green-700">
            <ThumbsUp className="h-3 w-3" />{upvotes}
          </span>
          <span className="flex items-center gap-1 text-red-900">
            <ThumbsDown className="h-3 w-3" />{downvotes}
          </span>
        </div>
      </div>

      {/* Icons row */}
      <div className="px-3 pb-2.5 flex items-center gap-1.5 flex-wrap">
        {/* Blood types */}
        {bloods.map((blood, i) => (
          <div
            key={`blood-${i}`}
            title={blood.name}
            className="w-6 h-6 rounded border border-red-900/40 bg-black/40 overflow-hidden flex items-center justify-center shrink-0"
          >
            <img src={blood.image} className="w-5 h-5 object-contain" alt={blood.name} />
          </div>
        ))}

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* Spells */}
        {spellImgs.map((img, i) => (
          <div
            key={`spell-${i}`}
            className="w-6 h-6 rounded border border-stone-700/50 bg-zinc-900/50 overflow-hidden flex items-center justify-center shrink-0"
          >
            {img ? <img src={img} className="w-5 h-5 object-contain" alt="" /> : <div className="w-5 h-5 bg-stone-800/50 rounded-sm" />}
          </div>
        ))}

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* Weapons (first 4) */}
        {weapons.map((weapon, i) => (
          <div
            key={`weapon-${i}`}
            title={(weapon as any).name}
            className="w-6 h-6 rounded border border-stone-700/30 bg-zinc-900/30 overflow-hidden flex items-center justify-center shrink-0"
          >
            {(weapon as any).image && (
              <img src={(weapon as any).image} className="w-5 h-5 object-contain" alt={(weapon as any).name} />
            )}
          </div>
        ))}
      </div>
    </Link>
  );
}
