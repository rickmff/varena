import { Modifier } from "@/components/machines/calculator";

export interface Armour {
  id: string;
  name: string;
  image: string;
  arenaCode: string;
  modifiers: Modifier[];
}