import { setup, assign, sendParent, sendTo, log, raise } from 'xstate';

export interface WeaponBuilderContext {
    weapon: Weapon | null; // ID of the selected weapon
    infusion: string | null; // ID of the selected infusion
    effects: string[]; // List of selected effects
    legendaryWeaponCount: number; // Count of legendary weapons selected
}

export type WeaponBuilderEvents =
    | { type: 'PICK_WEAPON'; weapon: Weapon }
    | { type: 'PICK_INFUSION'; infusion: string }
    | { type: 'ADD_EFFECT'; effectId: string }
    | { type: 'REMOVE_EFFECT'; effectId: string }
    | { type: 'RESET'; }
    | { type: 'ADD_WEAPON'; }
    | { type: 'goto.pickWeapon' }
    | { type: 'goto.pickEffect' }
    | { type: 'CLEAR_WEAPON' }

import { Weapon } from '../vbuilds/WeaponForge'; // Adjust the import path as necessary

import { MAX_LEGENDARY_WEAPONS_COUNT } from './builder'


export const weaponBuilderMachine = setup({
    types: {
        context: {} as WeaponBuilderContext,
        events: {} as WeaponBuilderEvents,
        input: {} as { legendaryWeaponCount: number, weapon: Weapon | null },
    },
}).createMachine({
    id: 'weaponBuilder',
    initial: 'determine',
    context: ({ input }) => ({
        legendaryWeaponCount: input.legendaryWeaponCount || 0,
        weapon: input.weapon || null,
        infusion: input.weapon?.infusion || null,
        effects: input.weapon?.effects || [],
    }),
    states: {
        determine: {
            entry: [
                ({ context, self }) => {
                    if (context.weapon?.effects?.length === 3) {
                        self.send({ type: 'goto.pickEffect' });
                    } else {
                        self.send({ type: 'goto.pickWeapon' });
                    }
                }
            ],
            on: {
                'goto.pickEffect': {
                    target: 'pickEffect'
                },
                'goto.pickWeapon': {
                    target: 'pickWeapon'
                }
            }
        },
        pickWeapon: {
            entry: [raise({ type: "CLEAR_WEAPON" })],
            on: {
                CLEAR_WEAPON: {
                    actions: assign({
                        weapon: null,
                        infusion: null,
                        // effects: [],
                    })
                },
                PICK_WEAPON: [
                    {
                        guard: ({ context, event }) => {
                            return context.legendaryWeaponCount === MAX_LEGENDARY_WEAPONS_COUNT && event.weapon.type === 'legendary';
                        },
                        actions: sendParent(({ context }) => ({
                            type: 'LEGENDARY_LIMIT_REACHED',
                        })),
                    },
                    {
                        target: 'pickInfusion',
                        guard: ({ event }) =>
                            event.weapon.type !== 'legendary',
                        actions: assign({
                            weapon: ({ event }) => event.weapon,
                        }),
                    },
                    {
                        target: 'pickEffect',
                        actions: assign({
                            weapon: ({ event }) => event.weapon,
                        }),
                    },
                ],
            },
        },
        pickInfusion: {
            on: {
                PICK_INFUSION: {
                    target: 'pickEffect',
                    actions: assign({
                        infusion: ({ event }) => event.infusion,
                    }),
                },
            },
        },
        pickEffect: {
            on: {
                'goto.pickWeapon': { target: 'pickWeapon' },
                ADD_EFFECT: {
                    guard: ({ context }) => context.effects.length < 3,
                    actions: assign({
                        effects: ({ context, event }) => {
                            if (context.effects.length < 3) {
                                return [...context.effects, event.effectId];
                            }
                            return context.effects;
                        },
                    }),
                },
                REMOVE_EFFECT: {
                    actions: assign({
                        effects: ({ context, event }) =>
                            context.effects.filter(
                                (effect) => effect !== event.effectId
                            ),
                    }),
                },
                ADD_WEAPON: {
                    actions: sendParent(({ context }) => ({
                        type: 'ADD_WEAPON',
                        weapon: { ...context.weapon, effects: context.effects, infusion: context.infusion },
                    })),
                },
            },
        },
    },
});
