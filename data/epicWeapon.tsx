import { StaticImageData } from "next/image"

// Define the image paths as strings
const weaponImagePaths = {
  Spear_Epic: "/images/weapons/Stunlock_Icon_SteelSpear02_Epic.webp",
  Axe_Epic: "/images/weapons/Stunlock_Icon_SteelAxe02_Epic.webp",
  Greatsword_Epic: "/images/weapons/Stunlock_Icon_SteelGreatSword02_Epic.webp",
  Crossbow_Epic: "/images/weapons/Stunlock_Icon_SteelCrossbow02_Epic.webp",
  Pistols_Epic: "/images/weapons/Stunlock_Icon_Steel_Pistol02_Epic.webp",
  Reaper_Epic: "/images/weapons/Stunlock_Icon_SteelScythe02_Epic.webp",
  Sword_Epic: "/images/weapons/Stunlock_Icon_SteelSword02_Epic.webp",
  Mace_Epic: "/images/weapons/Stunlock_Icon_SteelMace02_Legendary_Epic.webp",
  Whip_Epic: "/images/weapons/Stunlock_Icon_SteelWhip02_Epic.webp",
  Longbow_Epic: "/images/weapons/Stunlock_Icon_SteelBow02_Epic.webp",
  Twinblades_Epic: "/images/weapons/Stunlock_Icon_SteelTwinBlades02_Epic.webp",
  Claws_Epic: "/images/weapons/Stunlock_Icon_SteelClaws02_Epic.webp",
  Daggers_Epic: "/images/weapons/Stunlock_Icon_SteelDaggers02_Epic.webp",
  Slashers_Epic: "/images/weapons/Stunlock_Icon_SteelSlashers02_Epic.webp",
}

// Export the paths
export const epicWeapons = weaponImagePaths;

export type EpicWeapon = keyof typeof epicWeapons;

// Update the dropdown to use the paths
export const epicWeaponsDropdown = Object.entries(weaponImagePaths).map(([key, value]) => ({
  name: key,
  image: value
}));

