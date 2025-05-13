import { StaticImageData } from "next/image"

// Define the image paths as strings
const weaponImagePaths = {
  Spear_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Spear_Unique_T08_Variation01.png",
  Axe_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Axe_Unique_T08_Variation01.png",
  Greatsword_Artifact: "/images/weapons/Stunlock_Icon_Weapon_GreatSword_Unique_T08_Variation01.png",
  Crossbow_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Crossbow_Unique_T08_Variation01.png",
  Pistols_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Pistols_Unique_T08_Variation01.png",
  Reaper_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Reaper_Unique_T08_Variation01.png",
  Sword_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Sword_Unique_T08_Variation01.png",
  Mace_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Mace_Unique_T08_Variation01.png",
  Whip_Artifact: "/images/weapons/Stunlock_Icon_SteelBow02_Legendary.png",
  Longbow_Artifact: "/images/weapons/Stunlock_Icon_Weapon_LongBow_Unique_T08_Variation01",
  Slashers_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Slashers_Unique_T08_Variation01.png",
  Slashers2_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Slashers_Unique_T08_Variation02.png",
  Claws_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Claws_Unique_T08_Variation01.png",
  Daggers_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Daggers_Unique_T08_Variation01.png",
  Twinblades_Artifact: "/images/weapons/Stunlock_Icon_Weapon_Twinblades_Unique_T08_Variation01.png",
}

// Export the paths
export const artifactWeapons = weaponImagePaths;

// Update the dropdown to use the paths
export const artifactWeaponsDropdown = Object.entries(weaponImagePaths).map(([key, value]) => ({
  name: key,
  image: value
}));

// Update the ArtifactDetails type
export type ArtifactDetails = {
  artifactName: string;
  infuse: string;
  image: string;
}

// Update the details map to use string paths
export const artifactDetailsMap: Record<string, ArtifactDetails> = {
  slashers: { artifactName: "Cloud Dancers", infuse: "Lightning", image: weaponImagePaths.Slashers_Artifact },
  slashers2: { artifactName: "Wings of the Fallen", infuse: "Blood", image: weaponImagePaths.Slashers2_Artifact },
  spear: { artifactName: "The Thousand Storms", infuse: "Storm", image: weaponImagePaths.Spear_Artifact },
  axes: { artifactName: "The Red Twins", infuse: "Blood", image: weaponImagePaths.Axe_Artifact },
  greatsword: { artifactName: "Apocalypse", infuse: "Chaos", image: weaponImagePaths.Greatsword_Artifact },
  crossbow: { artifactName: "The Siren's Wail", infuse: "Illusion", image: weaponImagePaths.Crossbow_Artifact },
  pistols: { artifactName: "The Endbringers", infuse: "Chaos", image: weaponImagePaths.Pistols_Artifact },
  reaper: { artifactName: "Mortira's Lament", infuse: "Unholy", image: weaponImagePaths.Reaper_Artifact },
  sword: { artifactName: "The Gravecaller", infuse: "Unholy", image: weaponImagePaths.Sword_Artifact },
  mace: { artifactName: "Hand of Winter", infuse: "Frost", image: weaponImagePaths.Mace_Artifact },
  longbow: { artifactName: "Oaksong", infuse: "None", image: weaponImagePaths.Longbow_Artifact },
  whip: { artifactName: "The Morning Star", infuse: "Fire", image: weaponImagePaths.Whip_Artifact },
  claws: { artifactName: "Talons of the Lich Beast", infuse: "Unholy", image: weaponImagePaths.Claws_Artifact },
  daggers: { artifactName: "The Wraithblades", infuse: "Illusion", image: weaponImagePaths.Daggers_Artifact },
  twinblades: { artifactName: "The Fate Dancers", infuse: "Frost", image: weaponImagePaths.Twinblades_Artifact },
};

