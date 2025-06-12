export interface WeaponData {
  id: string;
  name: string;
  arenaCode: string;
  img: string;
}

export interface Weapon extends WeaponData {
  type: "legendary" | "epic";
  position: number;
  effects: string[];
  infusion?: string;
  uuid: string;
}