import bloodData from '@/data/vbuilds/bloodtypes.json'
import weaponEffectData from '@/data/vbuilds/weaponEffects.json'
import { BuildContext, BloodContext } from './builder'
import { AvailableWeaponSlots, Weapon } from '../vbuilds/WeaponForge';
import { stateIn } from 'xstate';


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
}


export const getBloodModifiers = (blood: BloodContext | null) => {
    if (!blood) return [];

    const primaryBloodEffect = bloodData[blood.primary].effects || {};
    const perk1 = primaryBloodEffect["I"].modifiers
    const perk2 = primaryBloodEffect["II"].modifiers
    const perk3 = primaryBloodEffect["III"].modifiers
    const perk4 = primaryBloodEffect["IV"].modifiers

    const perks = [perk1, perk2, perk3, perk4].flatMap((perk) => {
        return perk.map((perk) => {
            const increase = perk.value * (20 / 100)
            const newValue = perk.value + increase
            return { ...perk, value: newValue }
        })
    })

    const infusionEffects = bloodData[blood.secondary]?.effects?.[blood.infusion]?.modifiers


    const bloodModifiers = [...perks, ...infusionEffects]


    return bloodModifiers
};

export const getPassiveModifiers = (passives: string[] | null) => {
    if (!passives) return [];
    const passiveModifiers: Modifier[] = passives.flatMap((passive) => passive.modifiers)

    console.log("passiveModifiers", passiveModifiers)

    return passiveModifiers
}

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

    return modifiers
}



export function computeFinalStats(context: BuildContext): Record<string, number> {
    const finalStats: Record<string, number> = {};

    // Start from defaultValue for each stat
    for (const [statName, statEntry] of Object.entries(context.baseStats)) {
        finalStats[statName] = statEntry.defaultValue;
    }

    const amulet = context.amulet?.attributes || [];
    const elixir = context.elixir?.modifiers || [];
    const bloodModifiers = getBloodModifiers(context.blood)
    const passiveModifiers = getPassiveModifiers(context.passives) || []
    const armour = context.armour?.modifiers || []

    console.log('armour', armour)
    const bagAndCapeModifiers = [
        { stat: "Max Health", value: 24, unit: "flat" }, // Tier 3 Cape
        { stat: "Max Health", value: 42, unit: "flat" }, // Bat Leather Bag
        { stat: "Resource Yield", value: 10, unit: "percent" },

    ] as Modifier[]

    const selectedWeaponModifiers = getWeaponSlotModifiers(context.weapons, context.focusedWeapon) || [];

    console.log("selectedWeaponModifiers", selectedWeaponModifiers)

    const allModifiers: Modifier[] = [
        ...armour,
        ...amulet,
        ...elixir,
        ...bloodModifiers,
        ...bagAndCapeModifiers,
        ...passiveModifiers,
        ...selectedWeaponModifiers

    ];
    console.log("allModifiers", allModifiers.filter(mod => mod.calculate !== false))

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

        if (mod.unit === "flat") {
            finalStats[mod.stat] = base + mod.value;
        } else if (mod.unit === "percent") {
            finalStats[mod.stat] = base + mod.value;
        }

        // Cap enforcement (optional per modifier or after all modifiers are applied)
        const cap = context.baseStats[mod.stat]?.cap;
        if (cap !== null && cap !== undefined && finalStats[mod.stat] > cap) {
            finalStats[mod.stat] = cap;
        }
    }

    return finalStats;
}