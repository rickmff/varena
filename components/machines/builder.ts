import { assign, enqueueActions, log, raise, setup, spawnChild, stopChild } from 'xstate';
import { AvailableWeaponSlots, Weapon } from '../vbuilds/WeaponForge';
import { weaponBuilderMachine } from './weaponBuilder';
import { toast } from 'sonner';

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
    amulet: any | null;
    elixir: any | null;
    coating: any | null;
    armour: any | null;
    passives: any[];
    weapons: Map<AvailableWeaponSlots, Weapon>; // Use a Map to store weapons by their slot
    blood: {
        primary: any | null;
        secondary: any | null;
        infusion: any | null;
    } | null;
    spells: {
        dash: any | null;
        spell1: any | null;
        spell2: any | null;
        ultimate: any | null;
    };
    selectedWeaponSlot: AvailableWeaponSlots | null; // Track the currently selected weapon slot
}

type BuildEvents =
    | { type: 'ADD_SOURCE'; source: ModifierSource }
    | { type: 'REMOVE_SOURCE'; sourceId: string }
    | { type: 'RESET_BUILD' }
    | { type: "goto.spellForge.dash" }
    | { type: "goto.spellForge.spell1" }
    | { type: "goto.spellForge.spell2" }
    | { type: "goto.spellForge.ultimate" }
    | { type: "goto.spellForge" }
    | { type: "goto.passiveForge" }
    | { type: "goto.bloodForge" }
    | { type: "goto.weaponForge", slot: AvailableWeaponSlots }
    | { type: "goto.overview" }
    | { type: "ADD_AMULET"; amulet: any }
    | { type: "ADD_BLOOD"; primary: any, secondary: any, infusion: any }
    | { type: "ADD_COATING"; coating: any }
    | { type: "ADD_ELIXIR"; elixir: any }
    | { type: "ADD_ARMOUR"; armour: any }
    | { type: 'ADD_PASSIVE'; passive: any }
    | { type: 'REMOVE_PASSIVE'; id: string }
    | { type: 'ADD_WEAPON'; weapon: Weapon }
    | { type: 'REMOVE_WEAPON'; position: AvailableWeaponSlots }
    | { type: 'ADD_SPELL'; spell: any, slot: "dash" | "ultimate" | "spell1" | "spell2", jewel?: number[] }
    | { type: 'REMOVE_SPELL'; id: string }
    | { type: 'LEGENDARY_LIMIT_REACHED' }

type StatEntry = {
    name: string;
    value: number;
    unit: string;
    cap: number | null;
    defaultValue: number;
};

export const MAX_LEGENDARY_WEAPONS_COUNT = 3;

export const builder = setup({
    types: {
        input: {} as { stats: Record<StatName, StatEntry>, build: Record<string, any> },
        context: {} as BuildContext,
        events: {} as BuildEvents
        // actions: 
    },
    actors: {
        weaponBuilder: weaponBuilderMachine
    }
}).createMachine({
    id: 'builder',
    initial: 'overview',
    context: ({ input }) => {
        console.log(input, "builder context");
        return {
            baseStats: input.stats,
            activeSources: [],
            passives: [],
            spells: {
                dash: null,
                spell1: null,
                spell2: null,
                ultimate: null,
            },
            weapons: new Map(), // Initialize weapons as an empty Map
            armour: null,
            amulet: null,
            elixir: input.build.elixir || null,
            coating: input.build.coating || null,
            blood: null,
            selectedWeaponSlot: null, // Initialize with null
        }
    },
    on: {
        'goto.overview': {
            target: '.overview',
        },
        "goto.bloodForge": {
            target: '.bloodForge',
        },
        "goto.passiveForge": {
            target: '.passiveForge',
        },
        'goto.spellForge.dash': {
            target: '.spellForge.dash',
        },
        'goto.spellForge.spell1': {
            target: '.spellForge.spell1',
        },
        'goto.spellForge.spell2': {
            target: '.spellForge.spell2',
        },
        'goto.spellForge.ultimate': {
            target: '.spellForge.ultimate',
        },
        'goto.weaponForge': {
            target: '.weaponForge',
            actions: assign({
                selectedWeaponSlot: ({ event }) => event.slot // Set the selected weapon slot
            })
        },
    },
    states: {
        overview: {
            // entry: [log(({ context }) => `Build machine initialized with base stats: ${JSON.stringify(context.baseStats)}`)],
            on: {
                ADD_AMULET: {
                    actions: assign({
                        amulet: ({ event }) => event.amulet
                    })
                },
                ADD_ELIXIR: {
                    actions: assign({
                        elixir: ({ event }) => event.elixir
                    })
                },
                ADD_ARMOUR: {
                    actions: assign({
                        armour: ({ event }) => event.armour
                    })
                },
                ADD_COATING: {
                    actions: assign({
                        coating: ({ event }) => event.coating
                    })
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
        bloodForge: {
            on: {
                ADD_BLOOD: {
                    actions: assign({
                        blood: ({ context, event }) => ({
                            primary: event.primary,
                            secondary: event.secondary,
                            infusion: event.infusion
                        })
                    }),
                    target: 'overview'
                }
            }
        },
        passiveForge: {
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
            }
        },
        weaponForge: {
            entry: [spawnChild('weaponBuilder', {
                id: 'weaponBuilder',
                input: ({ context }) => {
                    const weaponLength = Array.from(context.weapons.values())
                        .filter(w => w.type === "legendary").length

                    if (context.selectedWeaponSlot && context.weapons.has(context.selectedWeaponSlot)) {

                        return { legendaryWeaponCount: weaponLength - 1 }
                    }
                    return {
                        legendaryWeaponCount: weaponLength
                    }
                }
            })],
            exit: [
                assign({
                    selectedWeaponSlot: () => null // Reset the selected weapon slot when leaving weaponForge
                }),
                stopChild("weaponBuilder")
            ],
            on: {
                ADD_WEAPON: {
                    actions: enqueueActions(({ enqueue, context, event }) => {

                        enqueue.assign({
                            weapons: ({ context, event }) => {

                                if (context.selectedWeaponSlot === null) {
                                    return context.weapons;
                                }

                                const updatedWeapons = new Map(context.weapons);
                                updatedWeapons.set(context.selectedWeaponSlot, event.weapon);

                                return updatedWeapons;
                            }
                        });
                        enqueue.raise({ type: "goto.overview" });
                    }
                    )
                },
                REMOVE_WEAPON: {
                    actions: assign({
                        weapons: ({ context, event }) => {
                            const updatedWeapons = new Map(context.weapons);
                            updatedWeapons.delete(event.position);
                            return updatedWeapons;
                        }
                    })
                },
                LEGENDARY_LIMIT_REACHED: {
                    actions: [() => toast.error(`You can only use ${MAX_LEGENDARY_WEAPONS_COUNT} artifact weapons.`)],
                }
            }
        },
        spellForge: {
            initial: 'idle',
            states: {
                idle: {},
                dash: {},
                spell1: {},
                spell2: {},
                ultimate: {},
            },
            on: {
                ADD_SPELL: {
                    actions: [assign({
                        spells: ({ context, event }) => ({
                            ...context.spells, [event.slot]: event.spell
                        })
                    }), raise({ type: "goto.overview" })]
                },
            }
        },
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