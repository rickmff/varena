interface BloodModifier {
  stat: string;
  value: number;
  unit: string;
  calculate: boolean;
}

interface BloodEffect {
  description: string;
  modifiers: BloodModifier[];
}

interface BloodEffects {
  I: BloodEffect;
  II: BloodEffect;
  III: BloodEffect;
  IV: BloodEffect;
  V?: BloodEffect;
}

export interface Blood {
  name: string;
  id: string;
  image: string;
  arenaCode: string;
  effects: BloodEffects;
}

export type BloodType = keyof typeof import("@/data/vbuilds/bloodtypes.json");