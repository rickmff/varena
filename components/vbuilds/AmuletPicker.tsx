"use client";

import { useState } from "react";
import amuletsData from "@/data/vbuilds/amulets.json";
import { useBuilder } from "./BuildProvider";
import { Modifier } from "@/components/machines/builder";
import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";

export interface Amulet {
  id: string;
  name: string;
  image: string; // path to image
  attributes: Array<{
    stat: string;
    value: number;
    unit: "flat" | "percent";
  }>;
  effect: {
    description: string;
  };
}

export type AmuletCollection = Record<string, Amulet>;

const amulets: AmuletCollection = amuletsData as AmuletCollection;

export function AmuletPicker() {
  const [selectedAmulet, setSelectedAmulet] = useState<string | null>(null);
  const [hoveredAmulet, setHoveredAmulet] = useState<string | null>(null);
  const { builder } = useBuilder();

  return (
    <DropdownSelect
      options={Object.values(amulets)}
      defaultValue={null}
      onSelect={(id) =>
        builder.send({
          type: "ADD_SOURCE",
          source: {
            id: id,
            name: amulets[id].name,
            modifiers: amulets[id].attributes as Modifier[],
            type: "gear",
          },
        })
      }
      placeholder={
        <DropdownSelectPlaceholder
          image={amulets["amulet_blademaster"].image}
          text="Select Amulet"
        />
      }
    />
  );
}

//   Object.entries(amulets).map(([key, amulet]) => (
//     <div
//       key={key}
//       className="relative"
//       onMouseEnter={() => setHoveredAmulet(key)}
//       onMouseLeave={() => setHoveredAmulet(null)}
//     >
//       <label
//         className={`flex flex-col items-center justify-center p-4 bg-gray-800 text-gray-200 rounded cursor-pointer ${
//           selectedAmulet === key
//             ? "bg-red-500 text-white hover:bg-red-500"
//             : "hover:bg-gray-700"
//         }`}
//       >
//         {amulet.image && (
//           <image
//             src={amulet.image}
//             alt={amulet.name}
//             className="w-16 h-16 mb-2 object-contain"
//           />
//         )}
//         <input
//           type="checkbox"
//           name="amulet"
//           value={key}
//           className="hidden"
//           checked={selectedAmulet === key}
//           onChange={() => handleAmuletChange(key)}
//         />
//         {/* <span className="text-center">{amulet.name}</span> */}
//       </label>
//       <Popover
//         title={amulet.name}
//         description={amulet.effect.description}
//         img={amulet.image}
//         isVisible={hoveredAmulet === key}
//       />
//     </div>
//   ));
// }
