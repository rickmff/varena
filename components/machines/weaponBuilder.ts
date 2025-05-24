import { setup, assign, sendParent, sendTo } from 'xstate';
import { toast } from 'sonner';

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

import { Weapon } from '../vbuilds/WeaponForge'; // Adjust the import path as necessary

import { MAX_LEGENDARY_WEAPONS_COUNT } from './builder'


export const weaponBuilderMachine = setup({
    types: {
        context: {} as WeaponBuilderContext,
        events: {} as WeaponBuilderEvents,
        input: {} as { legendaryWeaponCount: number },
    },
}).createMachine({
    id: 'weaponBuilder',
    initial: 'pickWeapon',
    context: ({ input }) => ({
        legendaryWeaponCount: input.legendaryWeaponCount || 0,
        weapon: null,
        infusion: null,
        effects: [],
    }),
    states: {
        pickWeapon: {
            on: {
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
