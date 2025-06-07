import bloodData from '@/data/vbuilds/bloodtypes.json';
import hotkeys from 'hotkeys-js';
import { toast } from 'sonner';
import { assertEvent, assign, enqueueActions, fromCallback, log, raise, setup, spawnChild, stopChild } from 'xstate';
import { Coating } from '../vbuilds/CoatingPicker';
import { AvailableWeaponSlots, Weapon } from '../vbuilds/WeaponForge';
import { StatName } from './calculator';
import { weaponBuilderMachine } from './weaponBuilder';
import { arenaCode } from './converter';

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
    advancedCoatings: boolean;
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
    | { type: "ADD_ALL_COATINGS"; coating: any }
    | { type: "REMOVE_ALL_COATINGS" }
    | { type: "TOGGLE_ADVANCED_COATINGS" }
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
    | { type: 'FOCUS_WEAPON', slot: AvailableWeaponSlots | null }
    | { type: 'UNFOCUS_WEAPON' }
    | { type: 'SAVE_BUILD', name?: string }

type StatEntry = {
    name: string;
    value: number;
    unit: string;
    cap: number | null;
    defaultValue: number;
};

export const MAX_LEGENDARY_WEAPONS_COUNT = 3;


const selectWeaponHotkeys = fromCallback(({ sendBack }) => {
    // Support both QWERTY (1-8) and AZERTY (&é"'(-è_) number keys
    hotkeys('1,2,3,4,5,6,7,8,&,é,",(,-,è,_,ç', (e) => {
        let slot;

        // Map AZERTY number keys to slots 1-8
        switch (e.key) {
            case '&': slot = '1'; break;
            case 'é': slot = '2'; break;
            case '"': slot = '3'; break;
            case "'": case "'": slot = '4'; break; // Handle different apostrophe characters
            case '(': slot = '5'; break;
            case '-': slot = '6'; break;
            case 'è': slot = '7'; break;
            case '_': case 'ç': slot = '8'; break; // AZERTY varies by region
            default: slot = e.key; // For QWERTY layout, use the key directly
        }

        // Convert to number and ensure it's in valid range
        const numSlot = parseInt(slot);
        if (numSlot >= 1 && numSlot <= 8) {
            sendBack({ type: 'FOCUS_WEAPON', slot: numSlot as AvailableWeaponSlots });
            document.getElementById(`weapon-slot-${numSlot}`)?.focus();
        }
    });

    // Support both layouts for resetting focus (0 and à)
    hotkeys('0,à', () => {
        sendBack({ type: 'UNFOCUS_WEAPON' });
    });

    return () => {
        // Unbind all hotkeys when component unmounts
        hotkeys.unbind('1,2,3,4,5,6,7,8,&,é,",(,-,è,_,ç,0,à');
    };
})

export const builder = setup({
    types: {
        input: {} as { stats: Record<StatName, StatEntry>, build: Record<string, any> },
        context: {} as BuildContext,
        events: {} as BuildEvents
        // actions: 
    },
    actions: {
        saveBuild: ({ context, event }) => {
            // Implement the logic to save the build, e.g., send it to a server or local storage
            // Convert build to arena code

            assertEvent(event, 'SAVE_BUILD');


            const buildCode = arenaCode(context);

            // Get existing arena codes from localStorage or initialize empty array
            const savedCodes = JSON.parse(localStorage.getItem('vbuilds') || '[]');

            // Add the new code with timestamp
            savedCodes.push({
                code: buildCode,
                timestamp: new Date().toISOString(),
                name: event.name || `Build ${savedCodes.length + 1}` // Default name
            });

            // Save back to localStorage
            localStorage.setItem('vbuilds', JSON.stringify(savedCodes));
            //redirect to /builds push state
            window.location.href = '/builds';
        }
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
            focusedWeapon: input.build.weapons.size != 0 ? input.build.weapons.entries().next().value[0] : null as AvailableWeaponSlots | null,
            advancedCoatings: input.build.advancedCoatings || false,
        }


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
        'SAVE_BUILD': {
            actions: 'saveBuild'
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
                ADD_ALL_COATINGS: {
                    actions: assign({
                        coatings: ({ context, event }) => {
                            const updatedCoatings = new Map(context.coatings);
                            for (let i = 1; i <= 8; i++) {
                                updatedCoatings.set(i as AvailableWeaponSlots, event.coating);
                            }
                            return updatedCoatings;
                        }
                    })
                },
                REMOVE_ALL_COATINGS: {
                    actions: assign({
                        coatings: ({ context, event }) => {
                            return new Map();
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
                TOGGLE_ADVANCED_COATINGS: {
                    actions: assign({
                        advancedCoatings: ({ context }) => {
                            return !context.advancedCoatings
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
                        blood: ({ event }) => ({
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

                    // Make sure to handle the case where the weapon might be undefined
                    const weapon = context.selectedWeaponSlot ? context.weapons.get(context.selectedWeaponSlot) || null : null;

                    if (context.selectedWeaponSlot && context.weapons.has(context.selectedWeaponSlot)) {
                        return { legendaryWeaponCount: weaponLength - 1, weapon }
                    }
                    return {
                        legendaryWeaponCount: weaponLength,
                        weapon
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
                    actions: enqueueActions(({ enqueue }) => {

                        enqueue.assign({
                            weapons: ({ context, event }) => {

                                if (context.selectedWeaponSlot === null) {
                                    return context.weapons;
                                }

                                const updatedWeapons = new Map(context.weapons);
                                updatedWeapons.set(context.selectedWeaponSlot, event.weapon);

                                return updatedWeapons;
                            },
                            focusedWeapon: ({ context }) => context.selectedWeaponSlot // Set the focused weapon to the selected slot
                        });
                        enqueue.raise({ type: "goto.overview" });
                    }
                    )
                },
                REMOVE_WEAPON: {
                    target: 'overview',
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
                    }), log(({ event }) => event), raise({ type: "goto.overview" })]
                },
            }
        },
    }
});
