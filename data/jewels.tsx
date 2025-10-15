interface Jewel {
  name: string;
  image: string;
  wiki: string;
  school: string;
  effects: { id: number; name: string }[];
}

const spellData: Record<string, Jewel> = {
  "veilofblood": {
    name: "Veil of Blood",
    image: "/images/spells/blooddash.webp",
    wiki: "https://vrising.fandom.com/wiki/Veil_Of_Blood",
    school: "blood",
    effects: [
      { id: 1, name: "Increase damage (12 - 24%) of next primary attack within 3s" },
      { id: 2, name: "Increase Elude duration (8 - 20%)" },
      { id: 3, name: "Next primary attack within 3s applies a fading Snare (1.2 - 2s)" },
      { id: 4, name: "Dashing through an enemy applies Leech" },
      { id: 5, name: "Next primary attack within 3s on an enemy affected by Leech increases physical power (8 - 16%) for 4s" },
      { id: 6, name: "Increase healing (1.2 - 2% max HP)" }
    ]
  },
  "bloodfountain": {
    name: "Blood Fountain",
    image: "/images/spells/bloodfountain.webp",
    wiki: "https://vrising.fandom.com/wiki/Blood_Fountain",
    school: "blood",
    effects: [
      { id: 1, name: "Hit applies Leech" },
      { id: 2, name: "Hit removes negative effects from caster and allies" },
      { id: 3, name: "Hit applies fading Snare (0.8 - 1.2s)" },
      { id: 4, name: "Increase hit healing (16 - 36%)" },
      { id: 5, name: "Recast to conjure an AoE that deals damage to enemies and heals allies (20 - 36%) on hit and then explodes (20 - 36%)" },
      { id: 6, name: "Increase explosion damage (16 - 32%)" },
      { id: 7, name: "Explosion pushes enemies back (1.6 - 3.2m)" },
      { id: 8, name: "Explosion increases ally MS (10% - 18%) for 3s" },
      { id: 9, name: "Increase explosion healing (30 - 50%)" }
    ]
  },
  "bloodrage": {
    name: "Blood Rage",
    image: "/images/spells/bloodrage.webp",
    wiki: "https://vrising.fandom.com/wiki/Blood_Rage",
    school: "blood",
    effects: [
      { id: 1, name: "Increase physical power (8% - 16%)" },
      { id: 2, name: "Kill an enemy to heal (1.2 - 2.5% max HP)" },
      { id: 3, name: "Increase effect duration (12 - 24%)" },
      { id: 4, name: "Increase MS (2 - 6%)" },
      { id: 5, name: "Cast grants a shield (25 - 45%) to caster and allies" },
      { id: 6, name: "Cast applies a fading Snare (0.8 - 1.6s) on enemies" },
      { id: 7, name: "Cast removes all negative effects from caster" }
    ]
  },
  "bloodrite": {
    name: "Blood Rite",
    image: "/images/spells/bloodrite.webp",
    wiki: "https://vrising.fandom.com/wiki/Blood_Rite",
    school: "blood",
    effects: [
      { id: 1, name: "Trigger applies a fading Snare (1.2 - 2.4s)" },
      { id: 2, name: "Increase damage (12 - 20%)" },
      { id: 3, name: "Trigger for first primary attack within 5s to deal bonus damage (20 - 40%)" },
      { id: 4, name: "Trigger heals (30 - 50%)" },
      { id: 5, name: "Increase Immaterial duration (12 - 20%)" },
      { id: 6, name: "Turn invisible while Immaterial" },
      { id: 7, name: "Trigger conjurs a projectile towards each nearby enemy (1 - 5 max) that deals damage (16 - 24%) and applies Leech" },
      { id: 8, name: "Increase MS (20 - 36%) during channel" }
    ]
  },
  "sanguinecoil": {
    name: "Sanguine Coil",
    image: "/images/spells/sanguinecoil.webp",
    wiki: "https://vrising.fandom.com/wiki/Blood_Fountain",
    school: "blood",
    effects: [
      { id: 1, name: "Hit bounces projectile to an additional target or the caster to deal damage or heal (24 - 40%)" },
      { id: 2, name: "Increase damage (8 - 16%)" },
      { id: 3, name: "Increase ally healing (14 - 30%)" },
      { id: 4, name: "Increase life drain (30 - 50%)" },
      { id: 5, name: "Lethal attacks restore 1 charge" },
      { id: 6, name: "Hit on an enemy affected by Leech deals damage (12 - 24%)" },
      { id: 7, name: "Increase charges by 1" },
      { id: 8, name: "Increase projectile range and speed (12 - 24%)" }
    ]
  },
  "shadowbolt": {
    name: "Shadowbolt",
    image: "/images/spells/shadowbolt.webp",
    wiki: "https://vrising.fandom.com/wiki/Shadowbolt",
    school: "blood",
    effects: [
      { id: 1, name: "Hit conjures an AoE that deals damage (14 - 30%) and applies Leech" },
      { id: 2, name: "Hit on an enemy affected by Leech deals damage (40 - 60%)" },
      { id: 3, name: "Hit applies Vampiric Curse dealing (140 - 180%) leeching (14 - 30%) health after 3s. Decrease hit damage (140%)" },
      { id: 4, name: "Hit on an enemy affected by Leech heals (1.4 - 3% max HP)" },
      { id: 5, name: "Decrease cast time (12 - 24%)" },
      { id: 6, name: "Decrease CD (8 - 12%)" },
      { id: 7, name: "Hit pushes enemies back (1.6 - 3.2m)" },
      { id: 8, name: "Increase projectile range and speed (12 - 24%)" }
    ]
  },
  "carrionswarm": {
    name: "Carrion Swarm",
    image: "/images/spells/swarm.webp",
    wiki: "/",
    school: "blood",
    effects: [
      { id: 1, name: "Increase damage done by each bat by (5 - 10%)" },
      { id: 2, name: "Explode when reaching maximum distance dealing (16 - 32%) and inflicting Leech" },
      { id: 3, name: "Hits leeches (4 - 8%) health" },
      { id: 4, name: "Hitting the same target with all bats inflicts a (0.6 - 1s) stun" },
      { id: 5, name: "The first hit inflicts Lesser Vampiric Curse dealing (30 - 50%) damage and leeching (12 - 24%) health" },
      { id: 6, name: "Inflict a fading snare on enemies hit lasting (0.8 - 1.6s)" }
    ]
  },
  "veilofchaos": {
    name: "Veil of Chaos",
    image: "/images/spells/chaosdash.webp",
    wiki: "https://vrising.fandom.com/wiki/Veil_Of_Chaos",
    school: "chaos",
    effects: [
      { id: 1, name: "Next primary attack within 3s on an enemy affected by Ignite applies Agonising Flames" },
      { id: 2, name: "Increase damage (12 - 24%) of next primary attack within 3s" },
      { id: 3, name: "Increase Elude duration (8 - 20%)" },
      { id: 4, name: "Explosion applies a fading Snare (0.8 - 1.6s)" },
      { id: 5, name: "Increase explosion damage (12 - 24%)" },
      { id: 6, name: "Recast conjurs a second illusion that deals damage (40 - 80% first explosion damage) in an AoE after 2.2s" }
    ]
  },
  "aftershock": {
    name: "Aftershock",
    image: "/images/spells/aftershock.webp",
    wiki: "https://vrising.fandom.com/wiki/Aftershock",
    school: "chaos",
    effects: [
      { id: 1, name: "Increase damage (12 - 24%)" },
      { id: 2, name: "Hit applies a fading Snare (1 - 1.8s)" },
      { id: 3, name: "Cast knocks enemies back (1.6 - 3.2m)" },
      { id: 4, name: "Explosion on an enemy affected by Ignite applies Agonising Flames" },
      { id: 5, name: "Decrease CD (8 - 12%)" },
      { id: 6, name: "Increase projectile range (12 - 24%)" }
    ]
  },
  "chaosbarrier": {
    name: "Chaos Barrier",
    image: "/images/spells/chaosbar.webp",
    wiki: "https://vrising.fandom.com/wiki/Chaos_Barrier",
    school: "chaos",
    effects: [
      { id: 1, name: "Increase projectile damage per charge (8 - 16%)" },
      { id: 2, name: "Decrease CD (0.4 - 0.8s) on absorbed hit (3 max)" },
      { id: 3, name: "Projectile hit conjurs an AoE that deals damage (30 - 50%) and applies Ignite" },
      { id: 4, name: "Full charge applies Power Surge (2.4 - 4s) on the caster" },
      { id: 5, name: "Projectile hit applies Stun (0.4 - 1.2s)" },
      { id: 6, name: "Increase MS (8 - 12%) during channel" }
    ]
  },
  "chaosvolley": {
    name: "Chaos Volley",
    image: "/images/spells/chaosvolley.webp",
    wiki: "https://vrising.fandom.com/wiki/Chaos_Volley",
    school: "chaos",
    effects: [
      { id: 1, name: "Increase damage (8 - 20%)" },
      { id: 2, name: "Hitting a different enemy with the second projectile deals damage (40 - 60%)" },
      { id: 3, name: "Hit on an enemy affected by Ignite applies Agonising Flames" },
      { id: 4, name: "Decrease CD (8 - 12%)" },
      { id: 5, name: "Hit pushes enemies back (0.8 - 1.6m)" },
      { id: 6, name: "Increase projectile range and speed (12 - 24%)" }
    ]
  },
  "powersurge": {
    name: "Power Surge",
    image: "/images/spells/powersurge.webp",
    wiki: "https://vrising.fandom.com/wiki/Power_Surge",
    school: "chaos",
    effects: [
      { id: 1, name: "Increase AS (6 - 10%)" },
      { id: 2, name: "Increase physical damage (8 - 16%)" },
      { id: 3, name: "Increase MS (2 - 6%)" },
      { id: 4, name: "Lethal attacks during the effect increase duration by 1s (1 - 5 max)" },
      { id: 5, name: "Increase effect duration (12 - 24%)" },
      { id: 6, name: "Recast to remove the effect and conjure an AoE that deals damage (40 - 60%) and applies Ignite" },
      { id: 7, name: "Apply a shield (40 - 60%)" },
      { id: 8, name: "Removes all negative effects" }
    ]
  },
  "void": {
    name: "Void",
    image: "/images/spells/chaosvoid.webp",
    wiki: "https://vrising.fandom.com/wiki/Void",
    school: "chaos",
    effects: [
      { id: 1, name: "Increase damage (8 - 16%)" },
      { id: 2, name: "Explosion leaves behind an AoE that deals damage (8 - 16%) (3 max)" },
      { id: 3, name: "Explosion conjures 3 AoEs that explode to deal damage (12 - 24%) and apply Ignite" },
      { id: 4, name: "Increase recharge rate (8 - 12%)" },
      { id: 5, name: "Explosion on an enemy affected by Ignite applies Agonising Flames" },
      { id: 6, name: "Increase range (8 - 20%)" }
    ]
  },
  "rainofchaos": {
    name: "Rain of Chaos",
    image: "/images/spells/rainofchaos.webp",
    wiki: "/",
    school: "chaos",
    effects: [
      { id: 1, name: "Additional meteor strikes the center dealing (40 - 80%) when the effect ends" },
      { id: 2, name: "First meteor engulf the area dealing (8 - 16%) " },
      { id: 3, name: "There is 30% chance to spawn bigger meteor dealing (24 - 40%)" },
      { id: 4, name: "Inflict a fading snare on enemies lasting (0.4 - 1.2s)" },
      { id: 5, name: "Hitting a target affected by Ignite applies Agonising Flames" },
      { id: 6, name: "Reduce cooldown by (8 - 12%)" }
    ]
  },
  "veiloffrost": {
    name: "Veil of Frost",
    image: "/images/spells/frostdash.webp",
    wiki: "https://vrising.fandom.com/wiki/Veil_of_Frost",
    school: "frost",
    effects: [
      { id: 1, name: "Next primary attack within 3s consumes Chill and applies Freeze (1.4 - 3s)" },
      { id: 2, name: "Increase damage (12 - 24%) of next primary attack within 3s" },
      { id: 3, name: "Increase Elude duration (8 - 20%)" },
      { id: 4, name: "Next primary attack within 3s conjurs an AoE that does damage (30 - 50%) and applies Chill" },
      { id: 5, name: "Illusion explodes in an AoE that deals damage (20 - 40%) and applies Chill" },
      { id: 6, name: "Increase shield strength (30 - 50%)" }
    ]
  },

  "coldsnap": {
    name: "Cold Snap",
    image: "/images/spells/coldsnap.webp",
    wiki: "https://vrising.fandom.com/wiki/Cold_Snap",
    school: "frost",
    effects: [
      { id: 1, name: "Increase shield strength (26 - 50%)" },
      { id: 2, name: "Increase damage (8 - 20%)" },
      { id: 3, name: "Trigger increases MS (4 - 8%) during shield uptime" },
      { id: 4, name: "Increase Freeze duration (0.4 - 1.2s) on enemies affected by Chill" },
      { id: 5, name: "Trigger to deal damage (24 - 40%) and apply Chill on next primary attack within 6s" },
      { id: 6, name: "Increase MS (20 - 36%) during channel" }
    ]
  },

  "crystallance": {
    name: "Crystal Lance",
    image: "/images/spells/crystallance.webp",
    wiki: "https://vrising.fandom.com/wiki/Crystal_Lance",
    school: "frost",
    effects: [
      { id: 1, name: "Increase damage (50 - 70%) to enemies affected by Chill or Freeze" },
      { id: 2, name: "Projectile pierces enemies (1 - 5 max) dealing 50% reduced damage" },
      { id: 3, name: "Decrease cast time (12 - 24%)" },
      { id: 4, name: "Increase Freeze duration (0.4 - 1.2s) on enemies affected by Chill" },
      { id: 5, name: "Hit on an enemy affected by Chill or Freeze launches 8 projectiles that deal damage (16 - 32%) and apply Chill" },
      { id: 6, name: "Increase projectile range and speed (12 - 24%)" }
    ]
  },

  "frostbarrier": {
    name: "Frost Barrier",
    image: "/images/spells/frostbarr.webp",
    wiki: "https://vrising.fandom.com/wiki/Frost_Barrier",
    school: "frost",
    effects: [
      { id: 1, name: "Increase damage (8 - 20%)" },
      { id: 2, name: "Barrier hits (3 max) increase spell power (6 - 10%) for 6s" },
      { id: 3, name: "Barrier hits (3 max) decrease CD (0.4 - 0.8s)" },
      { id: 4, name: "Recast pushes enemies (1.6 - 3.2m)" },
      { id: 5, name: "Recast shields caster (40 - 80%) when hitting an enemy affected by Chill or Freeze" },
      { id: 6, name: "Recast consumes Chill and applies Freeze (2 - 4s)" },
      { id: 7, name: "Increase MS (8 - 12%) during channel" }
    ]
  },

  "frostbat": {
    name: "Frost Bat",
    image: "/images/spells/frostbat.webp",
    wiki: "https://vrising.fandom.com/wiki/Frost_Bat",
    school: "frost",
    effects: [
      { id: 1, name: "Hit on an enemy affected by Chill or Freeze launches 8 projectiles that deal damage (16 - 32%) and apply Chill" },
      { id: 2, name: "Hit on an enemy affected by Chill or Freeze shields caster (40 - 80%)" },
      { id: 3, name: "Hit conjures an AoE that deals damage (40 - 60%)" },
      { id: 4, name: "Increase damage (20 - 32%) to enemies affected by Chill or Freeze" },
      { id: 5, name: "Increase projectile range and speed (12 - 24%)" },
      { id: 6, name: "Decrease cast time (12 - 24%)" }
    ]
  },

  "icenova": {
    name: "Ice Nova",
    image: "/images/spells/icenova.webp",
    wiki: "https://vrising.fandom.com/wiki/Ice_Nova",
    school: "frost",
    effects: [
      { id: 1, name: "Explosion shields (40 - 80%) caster and allies" },
      { id: 2, name: "Increase damage (30 - 50%) to enemies affected by Chill or Freeze" },
      { id: 3, name: "Recast to conjure an AoE that explodes to deal damage (30 - 50% of first nova)" },
      { id: 4, name: "Decrease CD (8 - 12%)" },
      { id: 5, name: "Increase range (8 - 20%)" }
    ]
  },

  "arcticstorm": {
    name: "Arctic Storm",
    image: "/images/spells/arcticstorm.webp",
    wiki: "/",
    school: "frost",
    effects: [
      { id: 1, name: "Increase damage done by (12 - 24%)" },
      { id: 2, name: "Increase movement speed when channeling by (12 - 24%)" },
      { id: 3, name: "Increase freeze duration (0.4 - 0.8s) on enemies affected by Chill" },
      { id: 4, name: "Knocks enemies back (2 - 4m)" },
      { id: 5, name: "Heal self for (8 - 16%) of damage done" },
      { id: 6, name: "Shield self for (34 - 50%) of your spell power when activated" }
    ]
  },
  "veilofillusion": {
    name: "Veil of Illusion",
    image: "/images/spells/illudash.webp",
    wiki: "https://vrising.fandom.com/wiki/Veil_of_Illusion",
    school: "illusion",
    effects: [
      { id: 1, name: "Next primary attack within 3s on an enemy affected by Weaken grants a shield (20 - 40%)" },
      { id: 2, name: "Next primary attack within 3s deals damage (12 - 24%)" },
      { id: 3, name: "Increase Elude duration (8 - 20%)" },
      { id: 4, name: "Next primary attack within 3s applies a fading Snare (1.2 - 2s)" },
      { id: 5, name: "Illusion projectiles deal damage (13 - 20%)" },
      { id: 6, name: "Next primary attack within 3s grants Phantasm (1 - 5)" },
      { id: 7, name: "Recast to explode the Illusion to deal damage (20 - 36%) and apply Weaken" }
    ]
  },

  "misttrance": {
    name: "Mist Trance",
    image: "/images/spells/misttrance.webp",
    wiki: "https://vrising.fandom.com/wiki/Mist_Trance",
    school: "illusion",
    effects: [
      { id: 1, name: "Trigger increases first primary attack damage (30 - 50%) for 5s" },
      { id: 2, name: "Trigger applies Fear to enemies (0.8 - 1.2s) in a caster-centred AoE" },
      { id: 3, name: "Trigger increases MS (8 - 16%) for 3s" },
      { id: 4, name: "Trigger grants Phantasm (1 - 5)" },
      { id: 5, name: "Trigger reduces secondary weapon skill CD (40 - 80%)" },
      { id: 6, name: "Increase MS (20 - 36%) during channel" },
      { id: 7, name: "Trigger pushes enemies back (1.6 - 3.2m)" },
      { id: 8, name: "Increase distance travelled (8 - 20%)" }
    ]
  },

  "mosquito": {
    name: "Mosquito",
    image: "/images/spells/mosquito.webp",
    wiki: "https://vrising.fandom.com/wiki/Mosquito_(Spell)",
    school: "illusion",
    effects: [
      { id: 1, name: "Increase damage (20 - 40%)" },
      { id: 2, name: "Increase Fear duration (0.4 - 0.8s)" },
      { id: 3, name: "Increase summon max HP (20 - 40%)" },
      { id: 4, name: "Cast shields (40 - 60%) caster and allies" },
      { id: 5, name: "Explosion summons 3 Wisps that heal the caster and allies (30 - 50%) when walked over" }
    ]
  },

  "phantomaegis": {
    name: "Phantom Aegis",
    image: "/images/spells/phantomaegis.webp",
    wiki: "https://vrising.fandom.com/wiki/Phantom_Aegis",
    school: "illusion",
    effects: [
      { id: 1, name: "Recast to remove the effect and pull the target towards the caster" },
      { id: 2, name: "Breaking the shield conjurs a target-centred AoE that applies Fear (0.8 - 1.6s)" },
      { id: 3, name: "Increase duration (16 - 32%)" },
      { id: 4, name: "Increase spell power (12 - 24%)" },
      { id: 5, name: "Cast removes all negative effects from target" },
      { id: 6, name: "Cast knocks enemies back (1.6 - 3.2m) from target" },
      { id: 7, name: "Increase MS (6 - 14%)" }
    ]
  },

  "spectralwolf": {
    name: "Spectral Wolf",
    image: "/images/spells/specwolf.webp",
    wiki: "https://vrising.fandom.com/wiki/Spectral_Wolf",
    school: "illusion",
    effects: [
      { id: 1, name: "Hit consumes Weaken to summon a Wisp that heals the caster and allies (30 - 50%) when walked over" },
      { id: 2, name: "Hit on an enemy affected by Weaken grants a shield (25 - 40%) per target (3 max)" },
      { id: 3, name: "Increase projectile range and speed (12 - 24%)" },
      { id: 4, name: "Increase max bounces by 1" },
      { id: 5, name: "Decrease damage penalty per bounce (7 - 15%)" },
      { id: 6, name: "First hit applies a fading Snare (1.6 - 2.4s)" },
      { id: 7, name: "Hit returns the projectile to the caster on last bounce to heal (60 - 100%)" },
      { id: 8, name: "Hit on an enemy affected by Weaken grants Phantasm (1 - 4)" }
    ]
  },

  "wraithspear": {
    name: "Wraith Spear",
    image: "/images/spells/wraithspear.webp",
    wiki: "https://vrising.fandom.com/wiki/Wraith_Spear",
    school: "illusion",
    effects: [
      { id: 1, name: "Hit applies a fading Snare (0.8 - 1.6s)" },
      { id: 2, name: "Hit consumes Weaken to summon a Wisp that heals the caster and allies (30 - 50%) when walked over" },
      { id: 3, name: "Hit on an enemy affected by Weaken grants a shield (20 - 40%) per target (3 max)" },
      { id: 4, name: "Increase projectile range (12 - 24%)" },
      { id: 5, name: "Increase damage (16 - 28%)" },
      { id: 6, name: "Decrease damage penalty per hit (6 - 10%)" },
      { id: 7, name: "Hit grants allies a shield (60 - 100%)" }
    ]
  },

  "curse": {
    name: "Curse",
    image: "/images/spells/curse.webp",
    wiki: "/",
    school: "illusion",
    effects: [
      { id: 1, name: "Increase the damage modifier by (4 - 10%)" },
      { id: 2, name: "Deals (20 - 40%) magic damage on hit" },
      { id: 3, name: "Increase the duration of the Curse by (0.4 - 1s)" },
      { id: 4, name: "Reapply Weaken with (0.4 - 1s) increased duration when the Curse ends" },
      { id: 5, name: "Spawns a wisp healing for (20 - 40%) when the curse ends" },
      { id: 6, name: "Inflict a fading snare on enemies hit lasting (0.4 - 1.2s)" },
      { id: 7, name: "Knock the targets back (1.6 - 3.2m) on hit" }
    ]
  },
  "veilofstorm": {
    name: "Veil of Storm",
    image: "/images/spells/lightningdash.webp",
    wiki: "https://vrising.fandom.com/wiki/Veil_of_Storm",
    school: "storm",
    effects: [
      { id: 1, name: "Next primary attack within 3s consumes Static to apply Stun (0.3 - 0.5s)" },
      { id: 2, name: "Next primary attack within 3s deals damage (12 - 24%)" },
      { id: 3, name: "Increase Elude duration (8 - 20%)" },
      { id: 4, name: "Next primary attack within 3s applies a fading Snare (1.2 - 2s)" },
      { id: 5, name: "Dash through an enemy to apply Static" },
      { id: 6, name: "Illusion conjures an AoE that deals tick damage (12 - 20%) and applies Static" }
    ]
  },
  "balllightning": {
    name: "Ball Lightning",
    image: "/images/spells/balllightning.webp",
    wiki: "https://vrising.fandom.com/wiki/Ball_Storm",
    school: "storm",
    effects: [
      { id: 1, name: "Increase tick damage (3 - 7%)" },
      { id: 2, name: "Recast detonates the ball to deal damage (50 - 90%)" },
      { id: 3, name: "Explosion increases caster and ally MS (8 - 16%) for 4s" },
      { id: 4, name: "Explosion pushes enemies back (1.6 - 3.2m)" },
      { id: 5, name: "Increase projectile range (12 - 24%)" },
      { id: 6, name: "Explosion consumes Static to apply Stun (0.3 - 0.5s)" }
    ]
  },
  "cyclone": {
    name: "Cyclone",
    image: "/images/spells/cyclone.webp",
    wiki: "https://vrising.fandom.com/wiki/Thunder_Strike",
    school: "storm",
    effects: [
      { id: 1, name: "Increase damage (20 - 40%)" },
      { id: 2, name: "Increase damage done by storm shields (8 - 20%)" },
      { id: 3, name: "Chance to spawn an additional storm shield when the cyclone return to you (40 - 100%)" },
      { id: 4, name: "Each storm shield active grant (2 - 6%) life leech" },
      { id: 5, name: "Increase cast rate by (12 - 24%)" },
      { id: 6, name: "Increase projectile range and speed (12 - 24%)" },
      { id: 7, name: "Hit consumes Static to apply Stun (0.3 - 0.5s)" },
      { id: 8, name: "Hit consumes Static for the next 3 primary attacks within 6s to deal damage (12 - 24%) and apply Static" }
    ]
  },
  "discharge": {
    name: "Discharge",
    image: "/images/spells/discharge.webp",
    wiki: "https://vrising.fandom.com/wiki/Discharge",
    school: "storm",
    effects: [
      { id: 1, name: "Increase Storm Shield damage (8 - 20%)" },
      { id: 2, name: "Increase Stun duration (0.1 - 0.3s)" },
      { id: 3, name: "Recast to end counter and conjure a caster-centred AoE that deals damage (16 - 28%) and inflicting a 1s fading snare" },
      { id: 4, name: "Grants spell life leech (2 - 6%) per Storm Shield" },
      { id: 5, name: "Increase MS (20 - 36%) during channel" },
      { id: 6, name: "Trigger for the next 3 primary attacks within 6s to deal damage (12 - 24%) and apply Static" }
    ]
  },
  "lightningcurtain": {
    name: "Lightning Curtain",
    image: "/images/spells/lcurtain.webp",
    wiki: "https://vrising.fandom.com/wiki/Storm_Curtain",
    school: "storm",
    effects: [
      { id: 1, name: "Hit on caster or ally grants a shield (30 - 50%)" },
      { id: 2, name: "Increase tick damage (4 - 12%)" },
      { id: 3, name: "Block projectiles (3 max) for the next 3 primary attacks within 6s to deal damage (12 - 24%) and apply Static" },
      { id: 4, name: "Hit applies a fading Snare (0.8 - 1.6s)" },
      { id: 5, name: "Increase MS (8 - 16%)" }
    ]
  },
  "polarityshift": {
    name: "Polarity Shift",
    image: "/images/spells/polshift.webp",
    wiki: "https://vrising.fandom.com/wiki/Polarity_Shift",
    school: "storm",
    effects: [
      { id: 1, name: "Hit applies a fading Snare (0.8 - 1.6s)" },
      { id: 2, name: "Increase projectile range and speed (12 - 24%)" },
      { id: 3, name: "Hit consumes Static for the next 3 primary attacks within 6s to deal damage (12 - 24%) and apply Static" },
      { id: 4, name: "Teleport conjures an AoE at the target's location that deals damage (40 - 60%) and applies Static" },
      { id: 5, name: "Hit conjures an AoE at the caster's location that deals damage (40 - 60%) and applies Static" }
    ]
  },
  "lightningtendrils": {
    name: "Lightning Tendrils",
    image: "/images/spells/tendrils.webp",
    wiki: "https://vrising.fandom.com/wiki/Storm_Tendrils",
    school: "storm",
    effects: [
      { id: 1, name: "Lightning bolts deal (4 - 12%) increased damage" },
      { id: 2, name: "Launch 1 additional lightning bolt" },
      { id: 3, name: "There is (20 - 36%) chance to trigger Chain Lightning on hit" },
      { id: 4, name: "Increase MS when casting and channeling by (16 - 24%)" },
      { id: 5, name: "Hitting 6 bolts in a row on the same target inflicts a stun (0.8 - 1.6s)" },
      { id: 6, name: "Increase cast rate by (12 - 24%)" },
      { id: 7, name: "Increase projectile range and speed by (12 - 24%)" }
    ]
  },
  "veilofbones": {
    name: "Veil of Bones",
    image: "/images/spells/bonedash.webp",
    wiki: "https://vrising.fandom.com/wiki/Veil_of_Bones",
    school: "unholy",
    effects: [
      { id: 1, name: "Next primary attack within 3s deals damage (12 - 24%)" },
      { id: 2, name: "Increase Elude duration (8 - 20%)" },
      { id: 3, name: "Next primary attack within 3s to enemies below 20% max HP deals damage (20 - 40%)" },
      { id: 4, name: "Dash through an allied skeleton to heal it (40 - 80% summon max HP) and reset its uptime" },
      { id: 5, name: "Dashing through an enemy applies Condemn" },
      { id: 6, name: "Explode skeleton after 2.5s inflicting (40 - 80%)" },
      { id: 7, name: "Next primary attack within 3s summons a Skeleton Mage instead of a Skeleton Warrior" }
    ]
  },
  "boneexplosion": {
    name: "Bone Explosion",
    image: "/images/spells/boneex.webp",
    wiki: "https://vrising.fandom.com/wiki/Bone_Explosion",
    school: "unholy",
    effects: [
      { id: 1, name: "Increase damage (12 - 24%)" },
      { id: 2, name: "Explosion conjures an AoE that deals damage (30 - 50%) and applies Condemn" },
      { id: 3, name: "Explosion heals allied skeletons (40 - 80% summon max HP) and resets their uptime" },
      { id: 4, name: "Hit on an enemy under 30% max HP deals damage (18 - 30%). Lethal attacks reduce CD (1.2 - 2.4s)" },
      { id: 5, name: "Explosion conjures 8 projectiles that deal damage (30 - 50%) and apply Condemn" },
      { id: 6, name: "Explosion applies a fading Snare (0.8 - 1.6s)" },
      { id: 7, name: "Decrease CD (8 - 12%)" },
      { id: 8, name: "Increase range (8 - 20%)" },
      { id: 9, name: "Hitting an ally skeleton make it explode after 2.5s dealing (40 - 80%) and inflict Condemn" }
    ]
  },
  "corruptedskull": {
    name: "Corrupted Skull",
    image: "/images/spells/corruptedskull.webp",
    wiki: "https://vrising.fandom.com/wiki/Corrupted_Skull",
    school: "unholy",
    effects: [
      { id: 1, name: "Hit conjures a projectile that circles around the enemy that deals damage (8 - 16%) and applies Condemn" },
      { id: 2, name: "Increase damage (8 - 20%)" },
      { id: 3, name: "Launch 2 projectiles that deal damage (30 - 50% original damage) and apply Condemn" },
      { id: 4, name: "Hit pushes enemies (1.6 - 3.2m)" },
      { id: 5, name: "Increase projectile range and speed (12 - 24%)" },
      { id: 6, name: "Hit on allied skeleton causes it to explode in an AoE after 2.5s dealing (40 - 80%) and apply Condemn" }
    ]
  },
  "deathknight": {
    name: "Death Knight",
    image: "/images/spells/deathknight.webp",
    wiki: "https://vrising.fandom.com/wiki/Death_Knight",
    school: "unholy",
    effects: [
      { id: 1, name: "Increase summon damage (12 - 20%)" },
      { id: 2, name: "Increase summon uptime (20 - 40%)" },
      { id: 3, name: "Heal caster (12 - 24% summon damage)" },
      { id: 4, name: "Increase summon max HP (20 - 40%)" },
      { id: 5, name: "Uptime expiration summons a Skeleton Mage with increased damage (20 - 40%)" },
      { id: 6, name: "Cast applies a fading Snare (1 - 1.8s)" }
    ]
  },
  "soulburn": {
    name: "Soulburn",
    image: "/images/spells/soulburn.webp",
    wiki: "https://vrising.fandom.com/wiki/Soulburn",
    school: "unholy",
    effects: [
      { id: 1, name: "Inflict a fading snare (1.2 - 2.4s)" },
      { id: 2, name: "Increase cast rate by (12 - 24%)" },
      { id: 3, name: "Explode skeleton after 2.5s inflicting (40 - 80%)" },
      { id: 4, name: "Increase damage by (8 - 16%)" },
      { id: 5, name: "Increase life drain (12 - 24%)" },
      { id: 6, name: "Increase targets hit by 1" },
      { id: 7, name: "Shield self for (24 - 40%) of your spell power for each enemy hit" },
      { id: 8, name: "Chances to spawn a skeleton warrior for each enemy hit (60 - 100%)" }
    ]
  },
  "wardofthedamned": {
    name: "Ward of the Damned",
    image: "/images/spells/skellybar.webp",
    wiki: "https://vrising.fandom.com/wiki/Ward_of_the_Damned",
    school: "unholy",
    effects: [
      { id: 1, name: "Increase MS (8 - 12%) during channel" },
      { id: 2, name: "Explode skeleton after 2.5s inflicting (40 - 80%)" },
      { id: 3, name: "Increase recast damage (12 - 20%)" },
      { id: 4, name: "Barrier hit (melee) deals damage (30 - 50%) to attacker" },
      { id: 5, name: "Recast increases allied skeleton damage (19 - 30%) for 8s" },
      { id: 6, name: "Barrier hit (projectile) heals (25 - 45%)" },
      { id: 7, name: "Recast pushes enemies (1.6 - 3.2m)" },
      { id: 8, name: "Barrier hit has a chance (20 - 40%) to summon a Skeleton Mage" },
      { id: 9, name: "Recast shields (60 - 120%) allied skeletons for 4s" }
    ]
  },
  "unholychains": {
    name: "Unholy Chains",
    image: "/images/spells/chains.webp",
    wiki: "https://vrising.fandom.com/wiki/Unholy_Chains",
    school: "unholy",
    effects: [
      { id: 1, name: "Conjure a bone spirit around the target dealing (8 - 16%) " },
      { id: 2, name: "Deals (35 - 55%) damage every 0.7s but reduce the damage by (50 - 90%)" },
      { id: 3, name: "Increase duration by (0.2 - 0.4s) and the damage done by (40 - 60%)" },
      { id: 4, name: "Inflict a fading snare (0.6 - 1.4s)" },
      { id: 5, name: "Increase MS while channeling by (4 - 12%)" },
      { id: 6, name: "Heal self for (12 - 20%)" },
      { id: 7, name: "Reduce damage taken while channeling by (12 - 24%)" },
      { id: 8, name: "Spawns a nova of projectiles dealing (30 - 50%) each" },
      { id: 9, name: "Reduces the MS of the target by (4 - 12%)" }
    ]
  }
}

export default spellData;
