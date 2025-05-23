import elixirData from "@/data/vbuilds/elixirs.json";
import coatingData from "@/data/vbuilds/coatings.json";
import passiveData from "@/data/vbuilds/passives.json";
import { Coating } from "@/components/vbuilds/CoatingPicker";
import { Passive } from "../vbuilds/PassiveList";
import legendaryWeaponData from "@/data/vbuilds/legendary-weapons.json";
import epicWeaponData from "@/data/vbuilds/epic-weapons.json";
import infusionData from "@/data/vbuilds/infusions.json";
import weaponEffectData from "@/data/vbuilds/weaponEffects.json";
import amuletData from "@/data/vbuilds/amulets.json";
import { AvailableWeaponSlots, Weapon } from "../vbuilds/WeaponForge";
import { MAX_LEGENDARY_WEAPONS_COUNT } from "./builder";
import { armourOptions } from "../vbuilds/ArmourPicker";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import spellData from "@/data/vbuilds/spells.json";


const importElixir = (char: string) => {
    return Object.values(elixirData).find((elixir) => elixir.arenaCode == char);
}

const importCoatings = (chars: string) => {
    const result = new Map<number, Coating>();
    // console.log("coatings", chars);
    chars.split("").forEach((char, index) => {
        const coating = Object.values(coatingData).find((coating) => coating.arenaCode == char);
        if (coating) {
            result.set(index + 1, coating);
        }
    });
    return result;
}

const importPassives = (chars: string) => {
    // console.log("passives", chars)
    let result: Passive[] = [];
    chars.split("").forEach((char, index) => {
        const passive = Object.values(passiveData).find((passive) => passive.arenaCode == char);
        if (passive) {
            result.push({
                ...passive,
                modifiers: passive.modifiers.map(modifier => ({
                    ...modifier,
                    unit: modifier.unit as "flat" | "percent", // Explicitly cast unit to the expected type
                })),
            });
        }
    });
    return result;
}

const importSpells = (chars: string) => {
    console.log("spells", chars)
    const spellDataArray = Object.values(spellData);

    const veils = spellDataArray.filter(spell => spell.category === "veil");
    const spells = spellDataArray.filter(spell => spell.category === "spell");
    const ultimates = spellDataArray.filter(spell => spell.category === "ultimate");

    const spell1 = spells.find(spell => spell.arenaCode === chars[0]);
    const spell2 = spells.find(spell => spell.arenaCode === chars[5]);
    const veil = veils.find(spell => spell.arenaCode === chars[10]);
    const ultimate = ultimates.find(spell => spell.arenaCode === chars[15]);

    const output = {
        dash: { ...veil, jewel: [chars[1], chars[2], chars[3], chars[4]] },
        spell1: { ...spell1, jewel: [chars[6], chars[7], chars[8], chars[9]] },
        spell2: { ...spell2, jewel: [chars[11], chars[12], chars[13], chars[14]] },
        ultimate: ultimate
    }

    return output
}

const importWeapons = (chars: string) => {
    // console.log("weapons", chars);
    const weaponData = [
        ...Object.values(legendaryWeaponData).map(weapon => ({ ...weapon, type: "legendary" as const })),
        ...Object.values(epicWeaponData).map(weapon => ({ ...weapon, type: "epic" as const }))
    ];

    const weapons = new Map<number, Weapon>();
    let legendaryCount = 0; // Track the number of legendary weapons

    for (let i = 0; i < chars.length; i += 5) {
        const arenaCode = chars[i];
        const infusionCode = chars[i + 1];
        const effectCodes = chars.slice(i + 2, i + 5);
        // console.log("arenaCode", arenaCode);

        const weapon = weaponData.find(
            (weapon) => weapon.arenaCode === arenaCode
        );
        const infusion = Object.values(infusionData).find(
            (infusion) => infusion.arenaCode === infusionCode
        );

        const effects = effectCodes
            .split("")
            .map((code) => {
                const effect = Object.values(weaponEffectData).find((effect) => effect.key === code);
                return effect ? effect.id : undefined;
            })
            .filter((id): id is string => id !== undefined);

        const hasInfusion = weapon && weapon.type === "epic" && infusion ? true : false;

        if (weapon) {
            if (weapon.type === "legendary") {
                if (legendaryCount >= MAX_LEGENDARY_WEAPONS_COUNT) {
                    // console.log(`Skipping weapon at slot ${(i / 5) + 1} as it exceeds the legendary limit.`);
                    continue; // Skip setting this weapon if the legendary limit is exceeded
                }
                legendaryCount++;
            }

            const slot = (i / 5) + 1;
            weapons.set(slot, {
                ...weapon,
                position: slot as AvailableWeaponSlots,
                infusion: hasInfusion && infusion ? infusion.id : undefined,
                effects: effects,
            });
        }
    }


    return weapons;
};

const importAmulet = (char: string) => {
    return Object.values(amuletData).find((amulet) => amulet.arenaCode == char);
}

const importArmour = (chars: string) => {
    return armourOptions.find((option) => option.arenaCode == chars[0])
}


const importBlood = (chars: string) => {
    const primary = Object.values(bloodData).find((blood) => blood.arenaCode == chars[0]);
    const secondary = Object.values(bloodData).find((blood) => blood.arenaCode == chars[1]);
    const infusion = { 1: "I", 2: "II", 3: "III" }[chars[2]];
    if (chars.length !== 3) {
        return null
    }

    if (!primary || !secondary || !infusion) {
        return null
    }

    return { primary: primary.id, secondary: secondary.id, infusion }

}

const exportPassives = (passives: Passive[]) => {
    // console.log(passives)
    let result = "";
    for (let i = 0; i < 5; i++) {
        const passive = passives[i];
        if (passive) {
            result += passive.arenaCode;
        } else {
            result += "0"; // Default value if no passive is found
        }
    }

    return result;
}

const exportCoating = (coatings: Map<number, Coating>) => {
    let result = "";
    for (let i = 1; i <= 8; i++) {
        const coating = coatings.get(i);
        if (coating) {
            result += coating.arenaCode;
        } else {
            result += "0"; // Default value if no coating is found
        }
    }
    return result;
}

const exportSpells = (selectedSpells) => {
    // console.log("spells", spells)
    const spellDataArray = Object.values(spellData);

    const veils = spellDataArray.filter(spell => spell.category === "veil");
    const spells = spellDataArray.filter(spell => spell.category === "spell");
    const ultimates = spellDataArray.filter(spell => spell.category === "ultimate");

    const veil = veils.find(spell => spell.arenaCode === selectedSpells?.dash?.arenaCode);
    const spell1 = spells.find(spell => spell.arenaCode === selectedSpells?.spell1?.arenaCode);
    const spell2 = spells.find(spell => spell.arenaCode === selectedSpells?.spell2?.arenaCode);
    const ultimate = ultimates.find(spell => spell.arenaCode === selectedSpells?.ultimate?.arenaCode);

    return spell1?.arenaCode + selectedSpells?.spell1?.jewel.join("") + spell2?.arenaCode + selectedSpells?.spell2?.jewel.join("") + veil?.arenaCode + selectedSpells?.dash?.jewel.join("") + ultimate?.arenaCode
}

const exportWeapons = (weapons: Map<number, Weapon>) => {
    let result = "";

    for (let i = 1; i <= 8; i++) {
        const weapon = weapons.get(i);
        const e = weapons.get(8);
        if (weapon) {
            result += weapon.arenaCode || "0"; // Add weapon arena code
            result += weapon.infusion ? Object.values(infusionData).find(value => value.id === weapon.infusion)?.arenaCode || "0" : "0"; // Add infusion code
            result += weapon.effects.map(effectId => {
                const effect = Object.values(weaponEffectData).find(e => e.id === effectId);
                return effect ? effect.key : "0";
            }).join(""); // Add effects
        } else {
            result += "00000"; // Default value for empty weapon slot
        }
    }

    return result;
};


const exportArmour = (armourCode: string | undefined) => {
    return !armourCode ? "0000" : armourCode.repeat(4)
}

const exportBlood = (blood: { primary?: string; secondary?: string; infusion?: string } | null) => {
    console.log(blood)
    if (!blood || !blood.primary || !blood.secondary || !blood.infusion) {
        return "000";
    }

    const primary = bloodData[blood.primary as keyof typeof bloodData]?.arenaCode;
    const secondary = bloodData[blood.secondary as keyof typeof bloodData]?.arenaCode;
    const infusion = { "I": "1", "II": "2", "III": "3" }[blood.infusion];

    return primary + secondary + infusion;
};

export const exportVArenaCode = (build) => {
    console.log({ build })
    const elixir = build.elixir?.arenaCode || "0";
    const coatings = exportCoating(build.coatings);
    const passives = exportPassives(build.passives);
    const spells = exportSpells(build.spells);
    const weapons = exportWeapons(build.weapons);
    const amulet = build.amulet?.arenaCode || "0";
    const armour = exportArmour(build.armour?.arenaCode);
    const blood = exportBlood(build.blood)
    // const amu
    // const spells = build.spells
    // const passives = build.passives.map((passive) => passive.arenaCode).join("");
    // const veil = build.veil?.arenaCode || "0";
    // const ability1 = build.ability1?.arenaCode || "0";
    // const ability2 = build.ability2?.arenaCode || "0";
    // const ultimate = build.ultimate?.arenaCode || "0";
    // const weapons = Array.from(build.weapons.values()).map((weapon) => weapon.arenaCode).join("");
    // const amulet = build.amulet?.arenaCode || "0";
    // const chest = build.chest?.arenaCode || "0";
    // const legs = build.legs?.arenaCode || "0";
    // const boots = build.boots?.arenaCode || "0";
    // const gloves = build.gloves?.arenaCode || "0";
    // console.log(weapons)
    console.log('ar', armour)

    return elixir + coatings + passives + spells + weapons + amulet + armour + blood;
}

// 6271n24t1234j1245312342k3238e0238q5128o3238d023880187p3782l3187144445a2

export const convertStringToBuild = (input: string) => {
    const build = {
        elixir: importElixir(input[0]),
        coatings: importCoatings(input.slice(1, 9)),
        passives: importPassives(input.slice(9, 14)),
        spells: importSpells(input.slice(14, 30)),
        weapons: importWeapons(input.slice(30, 70)), // Adjusted to get 8 * 5 characters (40 characters) after spells
        amulet: importAmulet(input[70]),
        armour: importArmour(input.slice(71, 75)), // Adjusted to get 4 characters for the armour
        blood: importBlood(input.slice(75, 78)),
        // passives: parsed.passives,
        // elixir: parsed.elixir,
        // coating: parsed.coating,
        // passives: parsed.passives,
        // veil: parsed.veil,
        // ability1: parsed.ability1,
        // ability2: parsed.ability2,
        // ultimate: parsed.ultimate,
        // weapons: parsed.weapons,
        // amulet: parsed.amulet,
        // chest: parsed.chest,
        // legs: parsed.legs,
        // boots: parsed.boots,
        // gloves: parsed.gloves,
    };

    console.log("build", build);
    return build;
}

// passives: [],
// spells: {
//     dash: null,
//     spell1: null,
//     spell2: null,
//     ultimate: null,
// },
// weapons: new Map(), // Initialize weapons as an empty Map
// armour: null,
// amulet: null,
// elixir: null,
// coating: null,
// blood: null,
// selectedWeaponSlot: null, // Initialize with null


// export function generatePresetString(data: Record<string, string | string[]>) {
//     let result = "";

//     for (const section of sectionDefinitions) {
//         const { name, length, map } = section;
//         const value = data[name];

//         if (length === 1) {
//             // Single value
//             const char = Object.keys(map).find(key => map[key] === value);
//             if (!char) {
//                 throw new Error(`Invalid value '${value}' for section '${name}'`);
//             }
//             result += char;
//         } else {
//             // Range of values
//             if (!Array.isArray(value)) {
//                 throw new Error(`Expected an array for section '${name}', got '${typeof value}'`);
//             }
//             const chars = value.map(item => {
//                 const char = Object.keys(map).find(key => map[key] === item);
//                 if (!char) {
//                     throw new Error(`Invalid value '${item}' in section '${name}'`);
//                 }
//                 return char;
//             });
//             result += chars.join("");
//         }
//     }

//     return result;
// }

// // Example usage:
// const parsed = parsePresetString("6271n24t1234j1245312342k3238e0238q5128o3238d023880187p3782l3187144445a2");
// console.log(parsed);

// const generated = generatePresetString({
//     elixir: "AB_Elixir_Twisted_T01_Buff",
//     coating: "AB_Vampire_Coating_Chaos_Buff",
//     passives: ["Passive_Mistrance", "Passive_Tempest", "Passive_Juggernaut", "Passive_Knight", "Passive_Enigma"],
//     veil: "Passive_Mistrance",
//     ability1: ["Passive_Tempest", "Passive_Juggernaut", "Passive_Knight", "Passive_Enigma"],
//     ability2: ["Passive_Quickness", "Passive_Overload", "Passive_Dominance"],
//     ultimate: "Ultimate_Elixir_Bat_T01_Buff",
//     weapons: ["Weapon1", "Weapon2", "Weapon3"], // Example placeholders
//     amulet: "Amulet1", // Example placeholder
//     chest: "Chest1", // Example placeholder
//     legs: "Legs1", // Example placeholder
//     boots: "Boots1", // Example placeholder
//     gloves: "Gloves1", // Example placeholder
// });
// console.log(generated);