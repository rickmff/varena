import spellsData from "@/data/vbuilds/spells.json";

// Map from V Rising PrefabGUID hash (INT from DB) to spell key in spells.json
// To find the correct mapping, check the game server mod configuration
// or test in-game and match the hash IDs to spells.
//
// Usage: Add entries as { [hashId: number]: "spell_key_from_spells_json" }
const hashToSpellKey: Record<number, string> = {
  // === Blood ===
  // 651613264: "blood_fountain",
  // -987810170: "shadowbolt",

  // === Chaos ===
  // 1575317901: "chaos_volley",

  // === Frost ===
  // 1191439206: "crystal_lance",
  // 110097606: "frost_bat",

  // === Illusion ===
  // -1016145613: "spectral_wolf",

  // === Storm ===

  // === Unholy ===

  // === Veils (Dash) ===
  // 711231628: "veil_of_blood",

  // === Ultimates ===
  // 1966330719: "heart_strike",
  // 1650878435: "arctic_leap",
};

export interface SpellInfo {
  name: string;
  img: string;
  spellSchool: string;
  category: string;
}

export function getSpellByHash(hash: number): SpellInfo | null {
  const key = hashToSpellKey[hash];
  if (!key) return null;

  const spell = (spellsData as Record<string, any>)[key];
  if (!spell) return null;

  return {
    name: spell.name,
    img: spell.img,
    spellSchool: spell.spellSchool,
    category: spell.category,
  };
}

// Export all spell data for reference
export function getAllSpells(): Record<string, SpellInfo> {
  const result: Record<string, SpellInfo> = {};
  for (const [key, spell] of Object.entries(spellsData as Record<string, any>)) {
    result[key] = {
      name: spell.name,
      img: spell.img,
      spellSchool: spell.spellSchool,
      category: spell.category,
    };
  }
  return result;
}
