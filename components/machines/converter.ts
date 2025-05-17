export const Necks = new Map([
    ["Prefabs.Empty", 0],
    ["Prefabs.Item_MagicSource_General_T08_Blood", 1],
    ["Prefabs.Item_MagicSource_General_T08_Chaos", 2],
    ["Prefabs.Item_MagicSource_General_T08_Frost", 3],
    ["Prefabs.Item_MagicSource_General_T08_Illusion", 4],
    ["Prefabs.Item_MagicSource_General_T08_Storm", 5],
    ["Prefabs.Item_MagicSource_General_T08_Unholy", 6],
]);

export const BloodTypes: Map<string, number | string> = new Map<string, number | string>([
    ["Empty", 0],
    ["FrailedBlood", 1],
    ["BruteBlood", 2],
    ["CreatureBlood", 3],
    ["MutantBlood", 4],
    ["RogueBlood", 5],
    ["ScholarBlood", 6],
    ["WarriorBlood", 7],
    ["WorkerBlood", 8],
    ["DraculinBlood", 9],
    ["CorruptedBlood", "a"], // Updated to follow the custom indexing scheme
]);

export const LegendaryWeapons: Map<string, number | string> = new Map<string, number | string>([
    ["Prefabs.Item_Weapon_Axe_Legendary_T08", 0],
    ["Prefabs.Item_Weapon_Claws_Legendary_T08", 1],
    ["Prefabs.Item_Weapon_Crossbow_Legendary_T08", 2],
    ["Prefabs.Item_Weapon_Daggers_Legendary_T08", 3],
    ["Prefabs.Item_Weapon_GreatSword_Legendary_T08", 4],
    ["Prefabs.Item_Weapon_Longbow_Legendary_T08", 5],
    ["Prefabs.Item_Weapon_Mace_Legendary_T08", 6],
    ["Prefabs.Item_Weapon_Pistols_Legendary_T08", 7],
    ["Prefabs.Item_Weapon_Reaper_Legendary_T08", 8],
    ["Prefabs.Item_Weapon_Slashers_Legendary_T08", 9],
    ["Prefabs.Item_Weapon_Spear_Legendary_T08", "a"],
    ["Prefabs.Item_Weapon_Sword_Legendary_T08", "b"],
    ["Prefabs.Item_Weapon_TwinBlades_Legendary_T08", "c"],
    ["Prefabs.Item_Weapon_Whip_Legendary_T08", "d"],
]);

export const ArtifactWeapons: Map<string, number | string> = new Map<string, number | string>([
    ["Prefabs.Item_Weapon_Axe_Unique_T08_Variation01", 0],
    ["Prefabs.Item_Weapon_Claws_Unique_T08_Variation01", 1],
    ["Prefabs.Item_Weapon_Crossbow_Unique_T08_Variation01", 2],
    ["Prefabs.Item_Weapon_Daggers_Unique_T08_Variation01", 3],
    ["Prefabs.Item_Weapon_GreatSword_Unique_T08_Variation01", 4],
    ["Prefabs.Item_Weapon_Longbow_Unique_T08_Variation01", 5],
    ["Prefabs.Item_Weapon_Mace_Unique_T08_Variation01", 6],
    ["Prefabs.Item_Weapon_Pistols_Unique_T08_Variation01", 7],
    ["Prefabs.Item_Weapon_Reaper_Unique_T08_Variation01", 8],
    ["Prefabs.Item_Weapon_Slashers_Unique_T08_Variation01", 9],
    ["Prefabs.Item_Weapon_Slashers_Unique_T08_Variation02", "a"],
    ["Prefabs.Item_Weapon_Spear_Unique_T08_Variation01", "b"],
    ["Prefabs.Item_Weapon_Sword_Unique_T08_Variation01", "c"],
    ["Prefabs.Item_Weapon_TwinBlades_Unique_T08_Variation01", "d"],
    ["Prefabs.Item_Weapon_Whip_Unique_T08_Variation01", "e"],
]);

export const Coatings: Map<string, number> = new Map([
    ["AB_Vampire_Coating_Blood_Buff", 0],
    ["AB_Vampire_Coating_Chaos_Buff", 1],
    ["AB_Vampire_Coating_Frost_Buff", 2],
    ["AB_Vampire_Coating_Illusion_Buff", 3],
    ["AB_Vampire_Coating_Storm_Buff", 4],
    ["AB_Vampire_Coating_Unholy_Buff", 5],
]);

export const Elixirs: Map<string, number> = new Map([
    ["AB_Elixir_Bat_T01_Buff", 0],
    ["AB_Elixir_Beast_T01_Buff", 1],
    ["AB_Elixir_Blasphemous_T01_Buff", 2],
    ["AB_Elixir_Crow_T01_Buff", 3],
    ["AB_Elixir_Prowler_T01_Buff", 4],
    ["AB_Elixir_Raven_T01_Buff", 5],
    ["AB_Elixir_Twisted_T01_Buff", 6],
    ["AB_Elixir_WerewolfT01_Buff", 7],
]);

const elixirMap: Record<string, string> = {
    "0": "AB_Elixir_Bat_T01_Buff",
    "1": "AB_Elixir_Beast_T01_Buff",
    "2": "AB_Elixir_Blasphemous_T01_Buff",
    "3": "AB_Elixir_Crow_T01_Buff",
    "4": "AB_Elixir_Prowler_T01_Buff",
    "5": "AB_Elixir_Raven_T01_Buff",
    "6": "AB_Elixir_Twisted_T01_Buff",
    "7": "AB_Elixir_WerewolfT01_Buff",
};

const coatingMap: Record<string, string> = {
    "0": "AB_Vampire_Coating_Blood_Buff",
    "1": "AB_Vampire_Coating_Chaos_Buff",
    "2": "AB_Vampire_Coating_Frost_Buff",
    "3": "AB_Vampire_Coating_Illusion_Buff",
    "4": "AB_Vampire_Coating_Storm_Buff",
    "5": "AB_Vampire_Coating_Unholy_Buff",
};

const passiveMap: Record<string, string> = {
    "n": "Passive_Mistrance",
    "t": "Passive_Tempest",
    "j": "Passive_Juggernaut",
    "k": "Passive_Knight",
    "e": "Passive_Enigma",
    "q": "Passive_Quickness",
    "o": "Passive_Overload",
    "d": "Passive_Dominance",
    "p": "Passive_Precision",
    "l": "Passive_Lethality",
    "a": "Passive_Arcane",
};

const ultimateMap: Record<string, string> = {
    "0": "Ultimate_Elixir_Bat_T01_Buff",
    "1": "Ultimate_Elixir_Beast_T01_Buff",
    "2": "Ultimate_Elixir_Blasphemous_T01_Buff",
    "3": "Ultimate_Elixir_Crow_T01_Buff",
    "4": "Ultimate_Elixir_Prowler_T01_Buff",
    "5": "Ultimate_Elixir_Raven_T01_Buff",
    "6": "Ultimate_Elixir_Twisted_T01_Buff",
    "7": "Ultimate_Elixir_WerewolfT01_Buff",
};

const amuletMap: Record<string, string> = {}

const armorMap: Record<string, string> = {}
const weaponsMap: Record<string, string> = {}

const sectionDefinitions = [
    { name: "elixir", length: 1, map: elixirMap },
    { name: "coating", length: 1, map: coatingMap },
    { name: "passives", length: 5, map: passiveMap },
    { name: "veil", length: 5, map: passiveMap },
    { name: "ability1", length: 5, map: passiveMap },
    { name: "ability2", length: 5, map: passiveMap },
    { name: "ultimate", length: 1, map: ultimateMap },
    { name: "weapons", length: 40, map: weaponsMap },
    { name: "amulet", length: 1, map: amuletMap },
    { name: "chest", length: 1, map: armorMap },
    { name: "legs", length: 1, map: armorMap },
    { name: "boots", length: 1, map: armorMap },
    { name: "gloves", length: 1, map: armorMap },
    { name: "primaryBlood", length: 1, map: armorMap },
    { name: "secondaryBlood", length: 1, map: armorMap },
    { name: "secondaryInfusion", length: 1, map: armorMap },
];

export function parsePresetString(input: string) {
    const result: Record<string, string | string[]> = {};
    let currentIndex = 0;

    for (const section of sectionDefinitions) {
        const { name, length, map } = section;
        const slice = input.slice(currentIndex, currentIndex + length);

        if (length === 1) {
            // Single value
            const value = map[slice];
            if (!value) {
                throw new Error(`Invalid character '${slice}' for section '${name}'`);
            }
            result[name] = value;
        } else {
            // Range of values
            const values = slice.split("").map(char => {
                const value = map[char];
                if (!value) {
                    throw new Error(`Invalid character '${char}' in section '${name}'`);
                }
                return value;
            });
            result[name] = values;
        }

        currentIndex += length;
    }

    return result;
}

import elixirData from "@/data/vbuilds/elixirs.json";
import coatingData from "@/data/vbuilds/coatings.json";
import { Coating } from "@/components/vbuilds/CoatingPicker";
const getElixir = (char: string) => {
    return Object.values(elixirData).find((elixir) => elixir.arenaCode == char);
}

const getCoating = (chars: string) => {
    const result = new Map<number, Coating>();
    chars.split("").forEach((char, index) => {
        const coating = Object.values(coatingData).find((coating) => coating.arenaCode == char);
        if (coating) {
            result.set(index + 1, coating);
        }
    });
    return result;
}

// 6271n24t1234j1245312342k3238e0238q5128o3238d023880187p3782l3187144445a2

export const convertStringToBuild = (input: string) => {
    const build = {
        elixir: getElixir(input[0]),
        coating: getCoating(input.slice(2, 9)),
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