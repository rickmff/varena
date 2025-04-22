export const effectsData = {
  1: "AS",
  2: "Damage Reduction",
  3: "Max Health",
  4: "Movement Speed",
  5: "Phys Crit Chance",
  6: "Phys Crit Damage",
  7: "Weapon Skill Cooldown Recovery Rate",
  8: "Spell Crit Chance",
  9: "Spell Crit Damage",
  A: "Spell Skill Cooldown Recovery Rate",
  B: "Spell Power",
  C: "Spell Leech",
  D: "Resource Yield"
} as const;

export type EffectId = keyof typeof effectsData;