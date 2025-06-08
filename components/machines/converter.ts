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
import { MAX_LEGENDARY_WEAPONS_COUNT, BuildContext } from "./builder";
import { armourOptions } from "../vbuilds/ArmourPicker";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import spellData from "@/data/vbuilds/spells.json";
import { hasAdvancedCoatings } from "@/components/vbuilds/CoatingPicker";


const importElixir = (char: string) => {
    return Object.values(elixirData).find((elixir) => elixir.arenaCode == char);
}

const importCoatings = (chars: string) => {
    const result = new Map<number, Coating>();

    const advanceCoatings = hasAdvancedCoatings(chars)

    if (advanceCoatings.advanced) {

        chars.split("").forEach((char, index) => {
            const coating = Object.values(coatingData).find((coating) => coating.arenaCode == char);
            if (coating) {
                result.set(index + 1, coating);
            }
        });
    }

    if (!advanceCoatings.advanced && advanceCoatings.value) {
        const coating = Object.values(coatingData).find((coating) => coating.arenaCode == advanceCoatings.value);
        for (let i = 1; i <= 8; i++) {
            if (coating) {
                result.set(i, coating)
            }
        }
    }

    return result;
}

const importPassives = (chars: string) => {

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

    const spellDataArray = Object.values(spellData);

    const veils = spellDataArray.filter(spell => spell.category === "veil");
    const spells = spellDataArray.filter(spell => spell.category === "spell");
    const ultimates = spellDataArray.filter(spell => spell.category === "ultimate");

    const spell1 = spells.find(spell => spell.arenaCode === chars[0]);
    const spell2 = spells.find(spell => spell.arenaCode === chars[5]);
    const veil = veils.find(spell => spell.arenaCode === chars[10]);
    const ultimate = ultimates.find(spell => spell.arenaCode === chars[15]);

    const output = {
        spell1: spell1 ? { ...spell1, jewel: [chars[1], chars[2], chars[3], chars[4]] } : null,
        spell2: spell2 ? { ...spell2, jewel: [chars[6], chars[7], chars[8], chars[9]] } : null,
        dash: veil ? { ...veil, jewel: [chars[11], chars[12], chars[13], chars[14]] } : null,
        ultimate: ultimate || null
    };

    return output;
}

const importWeapons = (chars: string) => {

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
                uuid: crypto.randomUUID(),
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

    const spellDataArray = Object.values(spellData);

    const veils = spellDataArray.filter(spell => spell.category === "veil");
    const spells = spellDataArray.filter(spell => spell.category === "spell");
    const ultimates = spellDataArray.filter(spell => spell.category === "ultimate");

    const veil = veils.find(spell => spell.arenaCode === selectedSpells?.dash?.arenaCode);
    const spell1 = spells.find(spell => spell.arenaCode === selectedSpells?.spell1?.arenaCode);
    const spell2 = spells.find(spell => spell.arenaCode === selectedSpells?.spell2?.arenaCode);
    const ultimate = ultimates.find(spell => spell.arenaCode === selectedSpells?.ultimate?.arenaCode);

    const veilCode = veil?.arenaCode || "0";
    const veilJewels = selectedSpells?.dash?.jewel?.join("") || "0000";

    const spell1Code = spell1?.arenaCode || "0";
    const spell1Jewels = selectedSpells?.spell1?.jewel?.join("") || "0000";

    const spell2Code = spell2?.arenaCode || "0";
    const spell2Jewels = selectedSpells?.spell2?.jewel?.join("") || "0000";

    const ultimateCode = ultimate?.arenaCode || "0";

    return spell1Code + spell1Jewels + spell2Code + spell2Jewels + veilCode + veilJewels + ultimateCode;
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

    if (!blood || !blood.primary || !blood.secondary || !blood.infusion) {
        return "000";
    }

    const primary = bloodData[blood.primary as keyof typeof bloodData]?.arenaCode;
    const secondary = bloodData[blood.secondary as keyof typeof bloodData]?.arenaCode;
    const infusion = { "I": "1", "II": "2", "III": "3" }[blood.infusion];

    return primary + secondary + infusion;
};

export const arenaCode = (context: BuildContext) => exportVArenaCode({
    elixir: context.elixir,
    coatings: context.coatings,
    passives: context.passives,
    spells: context.spells,
    weapons: context.weapons,
    amulet: context.amulet,
    armour: context.armour,
    blood: context.blood,
})


export const exportVArenaCode = (build) => {

    const elixir = build.elixir?.arenaCode || "0";
    const coatings = exportCoating(build.coatings);
    const passives = exportPassives(build.passives);
    const spells = exportSpells(build.spells);
    const weapons = exportWeapons(build.weapons);
    const amulet = build.amulet?.arenaCode || "0";
    const armour = exportArmour(build.armour?.arenaCode);
    const blood = exportBlood(build.blood)



    return elixir + coatings + passives + spells + weapons + amulet + armour + blood;
}




export const convertStringToBuild = (input: string) => {
    const coatings = input.slice(1, 9)
    const build = {
        elixir: importElixir(input[0]),
        coatings: importCoatings(coatings),
        passives: importPassives(input.slice(9, 14)),
        spells: importSpells(input.slice(14, 30)),
        weapons: importWeapons(input.slice(30, 70)), // Adjusted to get 8 * 5 characters (40 characters) after spells
        amulet: importAmulet(input[70]),
        armour: importArmour(input.slice(71, 75)), // Adjusted to get 4 characters for the armour
        blood: importBlood(input.slice(75, 78)),
        advancedCoatings: hasAdvancedCoatings(coatings).advanced, // Assuming the 79th character indicates advanced coatings
    };


    return build;
}
