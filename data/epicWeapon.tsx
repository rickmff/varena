import Spear_Epic from "../public/images/weapons/Stunlock_Icon_SteelSpear02_Epic.png"
import Axe_Epic from "../public/images/weapons/Stunlock_Icon_SteelAxe02_Epic.png"
import Greatsword_Epic from "../public/images/weapons/Stunlock_Icon_SteelGreatsword02_Epic.png"
import Crossbow_Epic from "../public/images/weapons/Stunlock_Icon_SteelCrossbow02_Epic.png"
import Pistols_Epic from "../public/images/weapons/Stunlock_Icon_Steel_Pistol02_Epic.png"
import Reaper_Epic from "../public/images/weapons/Stunlock_Icon_SteelScythe02_Epic.png"
import Sword_Epic from "../public/images/weapons/Stunlock_Icon_SteelSword02_Epic.png"
import Mace_Epic from "../public/images/weapons/Stunlock_Icon_SteelMace02_Legendary_Epic.png"
import Whip_Epic from "../public/images/weapons/Stunlock_Icon_SteelWhip02_Epic.png"
import Longbow_Epic from "../public/images/weapons/Stunlock_Icon_SteelBow02_Epic.png"
import Twinblades_Epic from "../public/images/weapons/Stunlock_Icon_SteelTwinblades02_Epic.png"
import Claws_Epic from "../public/images/weapons/Stunlock_Icon_SteelClaws02_Epic.png"
import Daggers_Epic from "../public/images/weapons/Stunlock_Icon_SteelDaggers02_Epic.png"
import Slashers_Epic from "../public/images/weapons/Stunlock_Icon_SteelSlashers02_Epic.png"


export const epicWeapons = {
  Spear_Epic,
  Axe_Epic,
  Greatsword_Epic,
  Crossbow_Epic,
  Pistols_Epic,
  Reaper_Epic,
  Sword_Epic,
  Mace_Epic,
  Whip_Epic,
  Longbow_Epic,
  Twinblades_Epic,
  Claws_Epic,
  Daggers_Epic,
  Slashers_Epic,
} as const;

export type EpicWeapon = keyof typeof epicWeapons;

export const epicWeaponsDropdown = Object.entries(epicWeapons).map(([key, value]) => ({
  name: key,
  image: value
}));

