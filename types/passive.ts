export interface Passive {
  id: string;
  name: string;
  arenaCode: string;
  description: string;
  img: string;
  type: string;
  modifiers?: {
    stat: string;
    value: number;
    unit: string;
    calculate?: boolean;
  }[];
}