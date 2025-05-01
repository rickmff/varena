import { setup, createMachine, assign, log } from 'xstate';

type StatName =
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

export interface ModifierSource {
    id: string;        // unique id like "amulet_blademaster" or "blood_rogue"
    name: string;      // user friendly name like "Amulet of the Blademaster"
    type: "blood" | "item" | "buff" | "gear" | "passive"; // category
    modifiers: Modifier[];
}

interface BuildContext {
    baseStats: Record<StatName, StatEntry>;
    activeSources: ModifierSource[];
}

type BuildEvent =
    | { type: 'ADD_SOURCE'; source: ModifierSource }
    | { type: 'REMOVE_SOURCE'; sourceId: string }
    | { type: 'RESET_BUILD' };


type StatEntry = {
    name: string;
    value: number;
    unit: string;
    cap: number | null;
    defaultValue: number;
};




export const calculator = setup({
    types: {
        input: {} as { stats: Record<StatName, StatEntry> },
        context: {} as BuildContext,
        events: {} as BuildEvent
    }
}).createMachine({
    id: 'buildMachine',
    initial: 'ready',
    context: ({ input }) => {
        console.log(input)
        return {
            baseStats: input.stats,
            activeSources: []
        }
    },
    states: {
        ready: {
            entry: [log(({ context }) => `Build machine initialized with base stats: ${JSON.stringify(context.baseStats)}`)],
            on: {
                ADD_SOURCE: {
                    actions: assign({
                        activeSources: ({ context, event }) => [...context.activeSources, event.source]
                    })
                },
                REMOVE_SOURCE: {
                    actions: assign({
                        activeSources: ({ context, event }) =>
                            context.activeSources.filter((source: ModifierSource) => source.id !== event.sourceId)
                    })
                },
                RESET_BUILD: {
                    actions: assign({
                        activeSources: () => []
                    })
                }
            }
        }
    }
});


export function computeFinalStats(context: BuildContext): Record<string, number> {
    const finalStats: Record<string, number> = {};

    // Start from defaultValue for each stat
    for (const [statName, statEntry] of Object.entries(context.baseStats)) {
        finalStats[statName] = statEntry.defaultValue;
    }

    // Flatten all modifiers from all active sources
    const allModifiers: Modifier[] = context.activeSources.flatMap(source => source.modifiers);
    console.log("All Modifiers", allModifiers);
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
            // console.log("mod", mod)
            // finalStats[mod.stat] = base + (base * mod.value) / 100;
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