import { StaticImageData } from "next/image"

// Define the image paths as strings
const weaponImagePaths = {
  Spear_Epic: "/images/weapons/Stunlock_Icon_SteelSpear02_Epic.png",
  Axe_Epic: "/images/weapons/Stunlock_Icon_SteelAxe02_Epic.png",
  Greatsword_Epic: "/images/weapons/Stunlock_Icon_SteelGreatSword02_Epic.png",
  Crossbow_Epic: "/images/weapons/Stunlock_Icon_SteelCrossbow02_Epic.png",
  Pistols_Epic: "/images/weapons/Stunlock_Icon_Steel_Pistol02_Epic.png",
  Reaper_Epic: "/images/weapons/Stunlock_Icon_SteelScythe02_Epic.png",
  Sword_Epic: "/images/weapons/Stunlock_Icon_SteelSword02_Epic.png",
  Mace_Epic: "/images/weapons/Stunlock_Icon_SteelMace02_Legendary_Epic.png",
  Whip_Epic: "/images/weapons/Stunlock_Icon_SteelWhip02_Epic.png",
  Longbow_Epic: "/images/weapons/Stunlock_Icon_SteelBow02_Epic.png",
  Twinblades_Epic: "/images/weapons/Stunlock_Icon_SteelTwinBlades02_Epic.png",
  Claws_Epic: "/images/weapons/Stunlock_Icon_SteelClaws02_Epic.png",
  Daggers_Epic: "/images/weapons/Stunlock_Icon_SteelDaggers02_Epic.png",
  Slashers_Epic: "/images/weapons/Stunlock_Icon_SteelSlashers02_Epic.png",
}

// Export the paths
export const epicWeapons = weaponImagePaths;

export type EpicWeapon = keyof typeof epicWeapons;

// Update the dropdown to use the paths
export const epicWeaponsDropdown = Object.entries(weaponImagePaths).map(([key, value]) => ({
  name: key,
  image: value
}));

