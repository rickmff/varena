import { setup, createMachine, assign, log, raise } from 'xstate';

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
    type: "blood" | "item" | "buff" | "gear" | "amulet" | "passive"; // category
    modifiers: Modifier[];
}

interface BuildContext {
    baseStats: Record<StatName, StatEntry>;
    activeSources: ModifierSource[];
    passives: any[];
}

type BuildEvents =
    | { type: 'ADD_SOURCE'; source: ModifierSource }
    | { type: 'REMOVE_SOURCE'; sourceId: string }
    | { type: 'RESET_BUILD' }
    | { type: "goto.passiveForge" }
    | { type: "goto.overview" }
    | { type: 'ADD_PASSIVE'; passive: any }
    | { type: 'REMOVE_PASSIVE'; id: string }


type StatEntry = {
    name: string;
    value: number;
    unit: string;
    cap: number | null;
    defaultValue: number;
};




export const builder = setup({
    types: {
        input: {} as { stats: Record<StatName, StatEntry> },
        context: {} as BuildContext,
        events: {} as BuildEvents
        // actions: 
    }
}).createMachine({
    id: 'buildCalculator',
    initial: 'overview',
    context: ({ input }) => {
        return {
            baseStats: input.stats,
            activeSources: [],
            passives: [],
            // armour: null,
            // amulet: null,
            // elixir: null,
            // selectedWeapon: null,
            // armour: null,
            // amulet: null,
            // weapons: [],
            // passives: [],
        }
    },
    states: {
        overview: {
            entry: [log(({ context }) => `Build machine initialized with base stats: ${JSON.stringify(context.baseStats)}`)],
            on: {
                // CREATE_WEAPON: {},
                // CREATE_JEWEL: {

                // },
                "goto.passiveForge": {
                    target: 'passiveForge',
                },
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
        },
        bloodForge: {},
        passiveForge: {
            // entry: [raise({ type: "REMOVE_PASSIVES" })],
            on: {
                "goto.overview": {
                    target: 'overview',
                },
                ADD_PASSIVE: {
                    actions: assign({
                        passives: ({ context, event }) => [...context.passives, event.passive]
                    })
                },
                REMOVE_PASSIVE: {
                    actions: assign({
                        passives: ({ context, event }) => context.passives.filter((p: any) => p.id !== event.id)
                    })
                },
                REMOVE_PASSIVES: {
                    actions: assign({
                        passives: []
                    })
                },
            }
        },
        weaponForge: {
            // ADD_WEAPON: {},
        },
        spellForge: {},
        jewelForge: {},
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