import { assign, enqueueActions, fromCallback, log, raise, setup, spawnChild, stopChild } from 'xstate';
import { AvailableWeaponSlots, Weapon } from '../vbuilds/WeaponForge';
import { weaponBuilderMachine } from './weaponBuilder';
import { toast } from 'sonner';
import { Coating } from '../vbuilds/CoatingPicker';
import { StatName } from './calculator';
import bloodData from '@/data/vbuilds/bloodtypes.json';
import hotkeys from 'hotkeys-js';


export type BloodContext = {
    primary: keyof typeof bloodData,
    secondary: keyof typeof bloodData,
    infusion: keyof typeof bloodData[keyof typeof bloodData]['effects']
}

export interface BuildContext {
    baseStats: Record<StatName, StatEntry>;
    amulet: any | null;
    elixir: any | null;
    coatings: Map<AvailableWeaponSlots, Coating>;
    armour: any | null;
    passives: any[];
    weapons: Map<AvailableWeaponSlots, Weapon>; // Use a Map to store weapons by their slot
    blood: BloodContext | null;
    spells: {
        dash: any | null;
        spell1: any | null;
        spell2: any | null;
        ultimate: any | null;
    };
    selectedWeaponSlot: AvailableWeaponSlots | null; // Track the currently selected weapon slot
    focusedWeapon: AvailableWeaponSlots | null; // Track the focused weapon slot
}

type BuildEvents =
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
    | { type: "REMOVE_AMULET"; }
    | { type: "ADD_BLOOD"; primary: any, secondary: any, infusion: any }
    | { type: "ADD_COATING"; coating: any, slot: AvailableWeaponSlots }
    | { type: "REMOVE_COATING"; slot: AvailableWeaponSlots }
    | { type: "ADD_ELIXIR"; elixir: any }
    | { type: "REMOVE_ELIXIR"; }
    | { type: "ADD_ARMOUR"; armour: any }
    | { type: "REMOVE_ARMOUR"; }
    | { type: 'ADD_PASSIVE'; passive: any }
    | { type: 'REMOVE_PASSIVE'; id: string }
    | { type: 'ADD_WEAPON'; weapon: Weapon }
    | { type: 'REMOVE_WEAPON'; position: AvailableWeaponSlots }
    | { type: 'ADD_SPELL'; spell: any, slot: "dash" | "ultimate" | "spell1" | "spell2", jewel?: number[] }
    | { type: 'REMOVE_SPELL'; id: string }
    | { type: 'LEGENDARY_LIMIT_REACHED' }
    | { type: 'FOCUS_WEAPON', slot: AvailableWeaponSlots }
    | { type: 'UNFOCUS_WEAPON' }

type StatEntry = {
    name: string;
    value: number;
    unit: string;
    cap: number | null;
    defaultValue: number;
};

export const MAX_LEGENDARY_WEAPONS_COUNT = 3;


const selectWeaponHotkeys = fromCallback(({ sendBack }) => {
    hotkeys('1,2,3,4,5,6,7,8', (e) => {
        sendBack({ type: 'FOCUS_WEAPON', slot: e.key });
    })

    hotkeys('0', () => {
        sendBack({ type: 'UNFOCUS_WEAPON' });
    })

    return () => {
        hotkeys.unbind('1,2,3,4,5,6,7,8')
    }
})

export const builder = setup({
    types: {
        input: {} as { stats: Record<StatName, StatEntry>, build: Record<string, any> },
        context: {} as BuildContext,
        events: {} as BuildEvents
        // actions: 
    },
    actors: {
        weaponBuilder: weaponBuilderMachine,
        hotkeys: selectWeaponHotkeys
    }
}).createMachine({
    id: 'builder',
    initial: 'overview',
    context: ({ input }) => {

        const ctx = {
            baseStats: input.stats,
            activeSources: [],
            passives: input.build.passives || [],
            spells: input.build.spells || {
                dash: null,
                spell1: null,
                spell2: null,
                ultimate: null,
            },
            weapons: input.build.weapons || new Map(), // Initialize weapons as an empty Map
            armour: input.build.armour || null,
            amulet: input.build.amulet || null,
            elixir: input.build.elixir || null,
            coatings: input.build.coatings || new Map(),
            blood: input.build.blood || null,
            selectedWeaponSlot: null, // Initialize with null
            focusedWeapon: null as AvailableWeaponSlots | null, // Track the focused weapon slot
        }

        console.log("ctx", ctx)
        return ctx
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
            invoke: { id: 'hotkeys', src: 'hotkeys' },
            on: {
                ADD_AMULET: {
                    actions: assign({
                        amulet: ({ event }) => event.amulet
                    })
                },
                REMOVE_AMULET: {
                    actions: assign({
                        amulet: null
                    })
                },
                ADD_ELIXIR: {
                    actions: assign({
                        elixir: ({ event }) => event.elixir
                    })
                },
                REMOVE_ELIXIR: {
                    actions: assign({
                        elixir: null
                    })
                },
                ADD_ARMOUR: {
                    actions: assign({
                        armour: ({ event }) => event.armour
                    })
                },
                REMOVE_ARMOUR: {
                    actions: assign({
                        armour: null
                    })
                },
                ADD_COATING: {
                    actions: assign({
                        coatings: ({ context, event }) => {
                            const updatedCoatings = new Map(context.coatings);
                            updatedCoatings.set(event.slot, event.coating);
                            return updatedCoatings;
                        }
                    })
                },
                REMOVE_COATING: {
                    actions: assign({
                        coatings: ({ context, event }) => {
                            const updatedCoatings = new Map(context.coatings);
                            updatedCoatings.delete(event.slot);
                            return updatedCoatings;
                        }
                    })
                },
                FOCUS_WEAPON: {
                    actions: assign({
                        focusedWeapon: ({ event }) => event.slot // Set the focused weapon slot
                    }),
                },
                UNFOCUS_WEAPON: {
                    actions: assign({ focusedWeapon: () => null })
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
                            ...context.spells, [event.slot]: { ...event.spell, jewel: event.jewel }
                        })
                    }), raise({ type: "goto.overview" })]
                },
            }
        },
    }
});