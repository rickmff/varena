import bloodData from '@/data/vbuilds/bloodtypes.json'
import weaponEffectData from '@/data/vbuilds/weaponEffects.json'
import { BuildContext, BloodContext } from './builder'
import { AvailableWeaponSlots, Weapon } from '../vbuilds/WeaponForge';
import { stateIn } from 'xstate';
import { Passive } from "@/components/vbuilds/PassiveList";


export type StatName =
    | "Bonus Physical Power"
    | "Attack Speed"
    | "Physical Critical Chance"
    | "Physical Critical Power"
    | "Weapon Skill Power"
    | "Weapon Charge Gain"
    | "Bonus Spell Power"
    | "Spell Critical Chance"
    | "Spell Critical Power"
    | "Ultimate Power"
    | "Minion Damage"
    | "Spell Charge Gain"
    | "Bonus Movement Speed"
    | "Shapeshift Speed"
    | "Mount Speed"
    | "Damage Reduction"
    | "Shield Efficiency"
    | "Bonus Maximum Health"
    | "Health Regeneration"
    | "Healing Received"
    | "Primary Attack Leech"
    | "Weapon Skill Leech"
    | "Spell Leech"
    | "Blood Efficiency"
    | "Blood Drain Reduction"
    | "Resource Yield"
    | "Weapon Cooldown Rate"
    | "Spell Cooldown Rate"
    | "Veil Cooldown Rate"
    | "Ultimate Cooldown Rate"
    | "Max Health"
    | "Physical Power"
    | "Spell Power"
    | "Movement Speed"
    | "Resource Harvest Power";

export interface Modifier {
    stat: StatName;
    value: number;
    unit: "flat" | "percent";
    calculate?: boolean; // whether to apply this modifier in calculations, default true
    increaseCap?: number; // optional, used for displaying the cap increase
}


const increaseCap = (modifiers: any[]) => {
    return modifiers.map((modifier) => {
        const increase = modifier.value * (20 / 100)
        const newValue = modifier.value + increase
        return { ...modifier, value: newValue, increaseCap: increase }
    })
}
export const getBloodModifiers = (blood: BloodContext | null) => {
    if (!blood) return [];

    const primaryBloodEffect = bloodData[blood.primary].effects || {};
    const perk1 = primaryBloodEffect["I"].modifiers
    const perk2 = primaryBloodEffect["II"].modifiers
    const perk3 = primaryBloodEffect["III"].modifiers
    const perk4 = primaryBloodEffect["IV"].modifiers

    const primaryPerks = [perk1, perk2, perk3, perk4].flatMap((perks) => {
        return increaseCap(perks || [])
    })


    const secondaryBloodEffects = bloodData[blood.secondary].effects || {};
    const secondarySelectedModifier = secondaryBloodEffects?.[blood.infusion]?.modifiers
    const secondaryTier4Modifiers = secondaryBloodEffects?.['IV']?.modifiers

    const secondaryPerks = [secondarySelectedModifier, secondaryTier4Modifiers].flatMap((perks) => {
        return increaseCap(perks || [])
    })


    const bloodModifiers = [...primaryPerks, ...secondaryPerks, ...primaryBloodEffect["V"].modifiers]

    return bloodModifiers
};

export const getPassiveModifiers = (passives: Passive[] | null) => {
    if (!passives) return [];
    const passiveModifiers: Modifier[] = passives.flatMap((passive) =>
        (passive.modifiers || []).map(mod => ({
            ...mod,
            stat: mod.stat as StatName,
            unit: mod.unit as "flat" | "percent"
        }))
    );
    return passiveModifiers;
};

const getWeaponSlotModifiers = (weapons: Map<AvailableWeaponSlots, Weapon>, slot: AvailableWeaponSlots | null) => {
    if (!slot) return [];

    const weapon = weapons.get(Number(slot) as AvailableWeaponSlots);
    if (!weapon || !weapon.effects) {
        return [];
    }

    const modifiers = weapon.effects.flatMap(effect => {
        const modifiers = weaponEffectData.find(weaponEffect => weaponEffect.id === effect)?.modifiers || [];
        return modifiers
    });

    // All weaponse give Physical Power, so we add it here
    return [{
        "stat": "Physical Power",
        "value": 33.7,
        "unit": "flat",
        "calculate": true
    }, ...modifiers]
}



export const spellSchoolMasteryModifiers = [
    { stat: "Blood Drain Reduction", value: 15, unit: "percent" }, // Blood Mastery
    { stat: "Veil Cooldown Rate", value: 5, unit: "percent" }, // Chaos Mastery
    { stat: "Ultimate Power", value: 5, unit: "percent" }, // Chaos Mastery
    // { stat: "Health Regeneration", value: 15, unit: "percent" }, // Unholy Mastery
    { stat: "Spell Cooldown Rate", value: 5, unit: "percent" }, // Illusion Mastery
    { stat: "Shapeshift Speed", value: 6, unit: "percent" }, // Illusion Mastery
    { stat: "Shield Efficiency", value: 8, unit: "percent" }, // Frost Mastery
    { stat: "Attack Speed", value: 5, unit: "percent" }, // Storm Mastery
    { stat: "Mount Speed", value: 5, unit: "percent" }, // Storm Mastery
] as Modifier[]

export function computeFinalStats(context: BuildContext): Record<string, number> {
    const finalStats: Record<string, number | any> = {};

    // Start from defaultValue for each stat
    for (const [statName, statEntry] of Object.entries(context.baseStats)) {
        finalStats[statName] = statEntry.defaultValue;
    }

    const amulet = context.amulet?.attributes || [];
    const elixir = context.elixir?.modifiers || [];
    const bloodModifiers = getBloodModifiers(context.blood)
    const passiveModifiers = getPassiveModifiers(context.passives) || []
    const armour = context.armour?.modifiers || []


    const bagAndCapeModifiers = [
        { stat: "Max Health", value: 24, unit: "flat" }, // Tier 3 Cape
        { stat: "Max Health", value: 42, unit: "flat" }, // Bat Leather Bag
        { stat: "Resource Yield", value: 10, unit: "percent" },

    ] as Modifier[]

    const selectedWeaponModifiers = getWeaponSlotModifiers(context.weapons, context.focusedWeapon) || [];

    const allModifiers: Modifier[] = [
        ...armour,
        ...amulet,
        ...elixir,
        ...bloodModifiers,
        ...bagAndCapeModifiers,
        ...passiveModifiers,
        ...selectedWeaponModifiers,
        ...spellSchoolMasteryModifiers
    ];


    // Apply each modifier
    for (const mod of allModifiers) {
        if (mod.calculate === false) {
            continue;
        }

        if (!(mod.stat in finalStats)) {
            // Stat not found in base, create new (optional depending on your needs)
            finalStats[mod.stat] = 0;

        }

        const base = finalStats[mod.stat];

        if (mod?.increaseCap) {
            finalStats["INCREASE_CAP"] = {
                ...finalStats["INCREASE_CAP"],
                [mod.stat]: (finalStats["INCREASE_CAP"]?.[mod.stat] || 0) + mod.increaseCap
            };
        }


        if (mod.unit === "flat") {
            finalStats[mod.stat] = base + mod.value;
        } else if (mod.unit === "percent") {
            finalStats[mod.stat] = base + mod.value;
        }
    }

    // Apply percentage bonuses to base stats
    if ("Bonus Spell Power" in finalStats) {
        const bonusPercent = finalStats["Bonus Spell Power"] / 100; // Convert to decimal
        finalStats["Spell Power"] = Number((finalStats["Spell Power"] * (1 + bonusPercent)).toFixed(1));
    }

    if ("Bonus Physical Power" in finalStats) {
        const bonusPercent = finalStats["Bonus Physical Power"] / 100; // Convert to decimal
        finalStats["Physical Power"] = Number((finalStats["Physical Power"] * (1 + bonusPercent)).toFixed(1));
    }

    // Apply other percentage-based bonuses
    if ("Bonus Maximum Health" in finalStats) {
        const bonusPercent = finalStats["Bonus Maximum Health"] / 100;
        finalStats["Max Health"] = Number((finalStats["Max Health"] * (1 + bonusPercent)).toFixed(1));
    }

    if ("Bonus Movement Speed" in finalStats) {
        const bonusPercent = finalStats["Bonus Movement Speed"] / 100;
        finalStats["Movement Speed"] = Number((finalStats["Movement Speed"] * (1 + bonusPercent)).toFixed(1));
    }

    return finalStats;
}