import Spear_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Spear_Unique_T08_Variation01.png"
import Axe_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Axe_Unique_T08_Variation01.png"
import Greatsword_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Greatsword_Unique_T08_Variation01.png"
import Crossbow_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Crossbow_Unique_T08_Variation01.png"
import Pistols_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Pistols_Unique_T08_Variation01.png"
import Reaper_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Reaper_Unique_T08_Variation01.png"
import Sword_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Sword_Unique_T08_Variation01.png"
import Mace_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Mace_Unique_T08_Variation01.png"
import Whip_Artifact from "../public/images/weapons/Stunlock_Icon_SteelBow02_Legendary.png"
import Longbow_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Longbow_Unique_T08_Variation01.png"
import Slashers_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Slashers_Unique_T08_Variation01.png"
import Slashers2_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Slashers_Unique_T08_Variation02.png"
import Claws_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Claws_Unique_T08_Variation01.png"
import Daggers_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Daggers_Unique_T08_Variation01.png"
import Twinblades_Artifact from "../public/images/weapons/Stunlock_Icon_Weapon_Twinblades_Unique_T08_Variation01.png"
import { StaticImageData } from "next/image"

export const artifactWeapons = {
  Spear_Artifact,
  Axe_Artifact,
  Greatsword_Artifact,
  Crossbow_Artifact,
  Pistols_Artifact,
  Reaper_Artifact,
  Sword_Artifact,
  Mace_Artifact,
  Whip_Artifact,
  Longbow_Artifact
} as const;

export type ArtifactWeapon = keyof typeof artifactWeapons;

export const artifactWeaponsDropdown = Object.entries(artifactWeapons).map(([key, value]) => ({
  name: key,
  image: value
}));

export type ArtifactDetails = {
  artifactName: string;
  infuse: string;
  image: StaticImageData;
};

export const artifactDetailsMap: Record<string, ArtifactDetails> = {
  slashers: { artifactName: "Cloud Dancers", infuse: "Lightning", image: Slashers_Artifact },
  slashers2: { artifactName: "Wings of the Fallen", infuse: "Blood", image: Slashers2_Artifact },
  spear: { artifactName: "The Thousand Storms", infuse: "Storm", image: Spear_Artifact },
  axes: { artifactName: "The Red Twins", infuse: "Blood", image: Axe_Artifact },
  greatsword: { artifactName: "Apocalypse", infuse: "Chaos", image: Greatsword_Artifact },
  crossbow: { artifactName: "The Siren's Wail", infuse: "Illusion", image: Crossbow_Artifact },
  pistols: { artifactName: "The Endbringers", infuse: "Chaos", image: Pistols_Artifact },
  reaper: { artifactName: "Mortira's Lament", infuse: "Unholy", image: Reaper_Artifact },
  sword: { artifactName: "The Gravecaller", infuse: "Unholy", image: Sword_Artifact },
  mace: { artifactName: "Hand of Winter", infuse: "Frost", image: Mace_Artifact },
  longbow: { artifactName: "Oaksong", infuse: "None", image: Longbow_Artifact },
  whip: { artifactName: "The Morning Star", infuse: "Fire", image: Whip_Artifact },
  claws: { artifactName: "Talons of the Lich Beast", infuse: "Unholy", image: Claws_Artifact },
  daggers: { artifactName: "The Wraithblades", infuse: "Illusion", image: Daggers_Artifact },
  twinblades: { artifactName: "The Fate Dancers", infuse: "Frost", image: Twinblades_Artifact },
};

