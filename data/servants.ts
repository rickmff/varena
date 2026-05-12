export type Servant = {
  id: string;
  name: string;
  prefabs: [string, string];
  code: string | null;
  group: string | null;
};

export const servants: Servant[] = [
  {
    "id": "CHAR_Gloomrot_AceIncinerator",
    "name": "Ace Incinerator",
    "prefabs": [
      "CHAR_Gloomrot_AceIncinerator",
      "CHAR_Gloomrot_AceIncinerator_Servant"
    ],
    "code": "0",
    "group": null
  },
  {
    "id": "CHAR_Blackfang_Alchemist",
    "name": "Alchemist",
    "prefabs": [
      "CHAR_Blackfang_Alchemist",
      "CHAR_Blackfang_Alchemist_Servant"
    ],
    "code": "1",
    "group": "A"
  },
  {
    "id": "CHAR_Militia_Heavy",
    "name": "Militia Veteran",
    "prefabs": [
      "CHAR_Militia_Heavy",
      "CHAR_Militia_Heavy_Servant"
    ],
    "code": "2",
    "group": "A"
  },
  {
    "id": "CHAR_Blackfang_Striker",
    "name": "Striker",
    "prefabs": [
      "CHAR_Blackfang_Striker",
      "CHAR_Blackfang_Striker_Servant"
    ],
    "code": "3",
    "group": "A"
  },
  {
    "id": "CHAR_ChurchOfLight_Cleric",
    "name": "Cleric",
    "prefabs": [
      "CHAR_ChurchOfLight_Cleric",
      "CHAR_ChurchOfLight_Cleric_Servant"
    ],
    "code": "4",
    "group": "A"
  },
  {
    "id": "CHAR_Militia_Nun",
    "name": "Nun",
    "prefabs": [
      "CHAR_Militia_Nun",
      "CHAR_Farmlands_Nun_Servant"
    ],
    "code": "5",
    "group": "A"
  },
  {
    "id": "CHAR_Blackfang_Sentinel",
    "name": "Sentinel",
    "prefabs": [
      "CHAR_Blackfang_Sentinel",
      "CHAR_Blackfang_Sentinel_Servant"
    ],
    "code": "6",
    "group": "A"
  },
  {
    "id": "CHAR_Blackfang_Viper",
    "name": "Viper",
    "prefabs": [
      "CHAR_Blackfang_Viper",
      "CHAR_Blackfang_Viper_Servant"
    ],
    "code": "7",
    "group": "A"
  },
  {
    "id": "CHAR_ChurchOfLight_Priest",
    "name": "Priest",
    "prefabs": [
      "CHAR_ChurchOfLight_Priest",
      "CHAR_ChurchOfLight_Priest_Servant"
    ],
    "code": "8",
    "group": "B"
  },
  {
    "id": "CHAR_ChurchOfLight_Paladin",
    "name": "Paladin",
    "prefabs": [
      "CHAR_ChurchOfLight_Paladin",
      "CHAR_ChurchOfLight_Paladin_Servant"
    ],
    "code": "9",
    "group": "B"
  },
  {
    "id": "CHAR_ChurchOfLight_Lightweaver",
    "name": "Lightweaver",
    "prefabs": [
      "CHAR_ChurchOfLight_Lightweaver",
      "CHAR_ChurchOfLight_Lightweaver_Servant"
    ],
    "code": "A",
    "group": "B"
  },
  {
    "id": "CHAR_Legion_NightMaiden",
    "name": "Dark Temptress",
    "prefabs": [
      "CHAR_Legion_NightMaiden",
      "CHAR_Legion_NightMaiden_Servant"
    ],
    "code": "B",
    "group": "C"
  },
  {
    "id": "CHAR_Legion_NightMaiden_Lesser",
    "name": "Night Maiden",
    "prefabs": [
      "CHAR_Legion_NightMaiden_Lesser",
      "CHAR_Legion_NightMaiden_Lesser_Servant"
    ],
    "code": "C",
    "group": "C"
  },
  {
    "id": "CHAR_Gloomrot_TractorBeamer",
    "name": "Tractor Beamer",
    "prefabs": [
      "CHAR_Gloomrot_TractorBeamer",
      "CHAR_Gloomrot_TractorBeamer_Servant"
    ],
    "code": "D",
    "group": "C"
  },
  {
    "id": "CHAR_Legion_Assassin",
    "name": "Exsanguinator",
    "prefabs": [
      "CHAR_Legion_Assassin",
      "CHAR_Legion_Assassin_Servant"
    ],
    "code": "E",
    "group": "C"
  },
  {
    "id": "CHAR_ChurchOfLight_Rifleman",
    "name": "Rifleman",
    "prefabs": [
      "CHAR_ChurchOfLight_Rifleman",
      "CHAR_ChurchOfLight_Rifleman_Servant"
    ],
    "code": "F",
    "group": "C"
  },
  {
    "id": "CHAR_Blackfang_Venomblade",
    "name": "Dreadcleaver",
    "prefabs": [
      "CHAR_Blackfang_Venomblade",
      "CHAR_Blackfang_Venomblade_Servant"
    ],
    "code": "G",
    "group": "D"
  },
  {
    "id": "CHAR_ChurchOfLight_Knight_2H",
    "name": "Knight",
    "prefabs": [
      "CHAR_ChurchOfLight_Knight_2H",
      "CHAR_ChurchOfLight_Knight_2H_Servant"
    ],
    "code": "H",
    "group": "D"
  },
  {
    "id": "CHAR_ChurchOfLight_Knight_Shield",
    "name": "Knight",
    "prefabs": [
      "CHAR_ChurchOfLight_Knight_Shield",
      "CHAR_ChurchOfLight_Knight_Shield_Servant"
    ],
    "code": "I",
    "group": "D"
  },
  {
    "id": "CHAR_Militia_Guard",
    "name": "Militia Guard",
    "prefabs": [
      "CHAR_Militia_Guard",
      "CHAR_Militia_Guard_Servant"
    ],
    "code": "J",
    "group": "D"
  },
  {
    "id": "CHAR_Militia_Devoted",
    "name": "Devoted",
    "prefabs": [
      "CHAR_Militia_Devoted",
      "CHAR_Militia_Devoted_Servant"
    ],
    "code": "K",
    "group": "D"
  },
  {
    "id": "CHAR_ChurchOfLight_SlaveMaster_Enforcer",
    "name": "Slave Master",
    "prefabs": [
      "CHAR_ChurchOfLight_SlaveMaster_Enforcer",
      "CHAR_ChurchOfLight_SlaveMaster_Enforcer_Servant"
    ],
    "code": "L",
    "group": "D"
  },
  {
    "id": "CHAR_ChurchOfLight_SlaveMaster_Sentry",
    "name": "Slave Master",
    "prefabs": [
      "CHAR_ChurchOfLight_SlaveMaster_Sentry",
      "CHAR_ChurchOfLight_SlaveMaster_Sentry_Servant"
    ],
    "code": "M",
    "group": "D"
  },
  {
    "id": "CHAR_Gloomrot_SentryOfficer",
    "name": "Sentry Officer",
    "prefabs": [
      "CHAR_Gloomrot_SentryOfficer",
      "CHAR_Gloomrot_SentryOfficer_Servant"
    ],
    "code": "N",
    "group": "D"
  },
  {
    "id": "CHAR_Gloomrot_Railgunner",
    "name": "Railgunner",
    "prefabs": [
      "CHAR_Gloomrot_Railgunner",
      "CHAR_Gloomrot_Railgunner_Servant"
    ],
    "code": "O",
    "group": "D"
  },
  {
    "id": "CHAR_Gloomrot_Tazer",
    "name": "Tazer",
    "prefabs": [
      "CHAR_Gloomrot_Tazer",
      "CHAR_Gloomrot_Tazer_Servant"
    ],
    "code": "P",
    "group": "D"
  },
  {
    "id": "CHAR_Gloomrot_Pyro",
    "name": "Pyro",
    "prefabs": [
      "CHAR_Gloomrot_Pyro",
      "CHAR_Gloomrot_Pyro_Servant"
    ],
    "code": "Q",
    "group": "D"
  },
  {
    "id": "CHAR_Bandit_Mugger",
    "name": "Mugger",
    "prefabs": [
      "CHAR_Bandit_Mugger",
      "CHAR_Bandit_Mugger_Servant"
    ],
    "code": "R",
    "group": "D"
  },
  {
    "id": "CHAR_Bandit_Thief",
    "name": "Thief",
    "prefabs": [
      "CHAR_Bandit_Thief",
      "CHAR_Bandit_Thief_Servant"
    ],
    "code": "S",
    "group": "D"
  },
  {
    "id": "CHAR_Bandit_Trapper",
    "name": "Trapper",
    "prefabs": [
      "CHAR_Bandit_Trapper",
      "CHAR_Bandit_Trapper_Servant"
    ],
    "code": "T",
    "group": "D"
  },
  {
    "id": "CHAR_Bandit_Stalker",
    "name": "Stalker",
    "prefabs": [
      "CHAR_Bandit_Stalker",
      "CHAR_Bandit_Stalker_Servant"
    ],
    "code": "U",
    "group": "E"
  },
  {
    "id": "CHAR_Militia_Torchbearer",
    "name": "Militia Torchbearer",
    "prefabs": [
      "CHAR_Militia_Torchbearer",
      "CHAR_Militia_Torchbearer_Servant"
    ],
    "code": "V",
    "group": "E"
  },
  {
    "id": "CHAR_Bandit_Bomber",
    "name": "Bomber",
    "prefabs": [
      "CHAR_Bandit_Bomber",
      "CHAR_Bandit_Bomber_Servant"
    ],
    "code": "W",
    "group": "E"
  },
  {
    "id": "CHAR_Militia_Bomber",
    "name": "Militia Demolisher",
    "prefabs": [
      "CHAR_Militia_Bomber",
      "CHAR_Militia_Bomber_Servant"
    ],
    "code": "X",
    "group": "E"
  },
  {
    "id": "CHAR_Militia_Crossbow",
    "name": "Militia Crossbow",
    "prefabs": [
      "CHAR_Militia_Crossbow",
      "CHAR_Militia_Crossbow_Servant"
    ],
    "code": "Y",
    "group": "E"
  },
  {
    "id": "CHAR_ChurchOfLight_Archer",
    "name": "Archer",
    "prefabs": [
      "CHAR_ChurchOfLight_Archer",
      "CHAR_ChurchOfLight_Archer_Servant"
    ],
    "code": "Z",
    "group": "E"
  },
  {
    "id": "CHAR_Blackfang_DartFlinger",
    "name": "Dartflinger",
    "prefabs": [
      "CHAR_Blackfang_DartFlinger",
      "CHAR_Blackfang_DartFlinger_Servant"
    ],
    "code": "a",
    "group": "E"
  },
  {
    "id": "CHAR_Militia_Longbowman",
    "name": "Militia Archer",
    "prefabs": [
      "CHAR_Militia_Longbowman",
      "CHAR_Militia_Longbowman_Servant"
    ],
    "code": "b",
    "group": "E"
  },
  {
    "id": "CHAR_Bandit_Deadeye",
    "name": "Deadeye",
    "prefabs": [
      "CHAR_Bandit_Deadeye",
      "CHAR_Bandit_Deadeye_Servant"
    ],
    "code": "c",
    "group": "E"
  },
  {
    "id": "CHAR_Blackfang_Lurker",
    "name": "Lurker",
    "prefabs": [
      "CHAR_Blackfang_Lurker",
      "CHAR_Blackfang_Lurker_Servant"
    ],
    "code": "d",
    "group": "E"
  },
  {
    "id": "CHAR_Bandit_Hunter",
    "name": "Poacher",
    "prefabs": [
      "CHAR_Bandit_Hunter",
      "CHAR_Bandit_Hunter_Servant"
    ],
    "code": "e",
    "group": "E"
  },
  {
    "id": "CHAR_ChurchOfLight_SlaveRuffian",
    "name": "Ruffian",
    "prefabs": [
      "CHAR_ChurchOfLight_SlaveRuffian",
      "CHAR_ChurchOfLight_SlaveRuffian_Servant"
    ],
    "code": "f",
    "group": "E"
  },
  {
    "id": "CHAR_ChurchOfLight_Miner_Standard",
    "name": "Miner",
    "prefabs": [
      "CHAR_ChurchOfLight_Miner_Standard",
      "CHAR_ChurchOfLight_Miner_Standard_Servant"
    ],
    "code": "g",
    "group": "E"
  },
  {
    "id": "CHAR_Militia_Light",
    "name": "Militia Skirmisher",
    "prefabs": [
      "CHAR_Militia_Light",
      "CHAR_Militia_Light_Servant"
    ],
    "code": "h",
    "group": "E"
  },
  {
    "id": "CHAR_Bandit_Thug",
    "name": "Thug",
    "prefabs": [
      "CHAR_Bandit_Thug",
      "CHAR_Bandit_Thug_Servant"
    ],
    "code": "i",
    "group": "E"
  },
  {
    "id": "CHAR_Bandit_Scout",
    "name": "Scout",
    "prefabs": [
      "CHAR_Bandit_Scout",
      "CHAR_Bandit_Scout_Servant"
    ],
    "code": "j",
    "group": "E"
  },
  {
    "id": "CHAR_ChurchOfLight_Footman",
    "name": "Footman",
    "prefabs": [
      "CHAR_ChurchOfLight_Footman",
      "CHAR_ChurchOfLight_Footman_Servant"
    ],
    "code": "k",
    "group": "E"
  },
  {
    "id": "CHAR_Blackfang_Peon",
    "name": "Peon",
    "prefabs": [
      "CHAR_Blackfang_Peon",
      "CHAR_Blackfang_Peon_Servant"
    ],
    "code": "l",
    "group": "E"
  },
  {
    "id": "CHAR_Gloomrot_Batoon",
    "name": "Batoon",
    "prefabs": [
      "CHAR_Gloomrot_Batoon",
      "CHAR_Gloomrot_Batoon_Servant"
    ],
    "code": "m",
    "group": "E"
  },
  {
    "id": "CHAR_Farmlands_Woodcutter_Standard",
    "name": "Woodcutter",
    "prefabs": [
      "CHAR_Farmlands_Woodcutter_Standard",
      "CHAR_Farmlands_Woodcutter_Standard_Servant"
    ],
    "code": "n",
    "group": "E"
  },
  {
    "id": "CHAR_Farmlands_Farmer",
    "name": "Farmer",
    "prefabs": [
      "CHAR_Farmlands_Farmer",
      "CHAR_Farmlands_Farmer_Servant"
    ],
    "code": "o",
    "group": "E"
  },
  {
    "id": "CHAR_Blackfang_WoodCarver",
    "name": "Carver",
    "prefabs": [
      "CHAR_Blackfang_WoodCarver",
      "CHAR_Blackfang_WoodCarver_Servant"
    ],
    "code": "p",
    "group": "E"
  },
  {
    "id": "CHAR_Bandit_Rascal",
    "name": "Rascal",
    "prefabs": [
      "CHAR_Bandit_Rascal",
      "CHAR_Bandit_Rascal_Servant"
    ],
    "code": "q",
    "group": "E"
  },
  {
    "id": "CHAR_Vampire_Cultist_Patrolling",
    "name": "Vampire Cultist",
    "prefabs": [
      "CHAR_Vampire_Cultist_Patrolling",
      "CHAR_Vampire_Cultist_Male_Servant"
    ],
    "code": "r",
    "group": "E"
  },
  {
    "id": "CHAR_Vampire_Cultist_Patrolling_Female",
    "name": "Vampire Cultist",
    "prefabs": [
      "CHAR_Vampire_Cultist_Patrolling_Female",
      "CHAR_Vampire_Cultist_Female_Servant"
    ],
    "code": "s",
    "group": "E"
  },
  {
    "id": "CHAR_Bandit_Worker_Gatherer",
    "name": "Gatherer",
    "prefabs": [
      "CHAR_Bandit_Worker_Gatherer",
      "CHAR_Bandit_Worker_Gatherer_Servant"
    ],
    "code": "t",
    "group": "E"
  },
  {
    "id": "CHAR_Bandit_Worker_Miner",
    "name": "Miner",
    "prefabs": [
      "CHAR_Bandit_Worker_Miner",
      "CHAR_Bandit_Miner_Standard_Servant"
    ],
    "code": "u",
    "group": "E"
  },
  {
    "id": "CHAR_Bandit_Worker_Woodcutter",
    "name": "Woodcutter",
    "prefabs": [
      "CHAR_Bandit_Worker_Woodcutter",
      "CHAR_Bandit_Woodcutter_Standard_Servant"
    ],
    "code": "v",
    "group": "E"
  },
  {
    "id": "CHAR_Gloomrot_Technician_Labworker",
    "name": "Labworker",
    "prefabs": [
      "CHAR_Gloomrot_Technician_Labworker",
      "CHAR_Gloomrot_Technician_Labworker_Servant"
    ],
    "code": "w",
    "group": "E"
  },
  {
    "id": "CHAR_Gloomrot_Technician",
    "name": "Technician",
    "prefabs": [
      "CHAR_Gloomrot_Technician",
      "CHAR_Gloomrot_Technician_Servant"
    ],
    "code": "x",
    "group": "E"
  },
  {
    "id": "CHAR_Gloomrot_Villager_Female",
    "name": "Villager",
    "prefabs": [
      "CHAR_Gloomrot_Villager_Female",
      "CHAR_Gloomrot_Villager_Female_Servant"
    ],
    "code": "y",
    "group": "E"
  },
  {
    "id": "CHAR_Gloomrot_Villager_Male",
    "name": "Villager",
    "prefabs": [
      "CHAR_Gloomrot_Villager_Male",
      "CHAR_Gloomrot_Villager_Male_Servant"
    ],
    "code": "z",
    "group": "E"
  },
  {
    "id": "CHAR_Militia_Miner_Standard",
    "name": "Miner",
    "prefabs": [
      "CHAR_Militia_Miner_Standard",
      "CHAR_Militia_Miner_Standard_Servant"
    ],
    "code": null,
    "group": "E"
  },
  {
    "id": "CHAR_ChurchOfLight_Villager_Female",
    "name": "Villager",
    "prefabs": [
      "CHAR_ChurchOfLight_Villager_Female",
      "CHAR_ChurchOfLight_Villager_Female_Servant"
    ],
    "code": null,
    "group": "E"
  },
  {
    "id": "CHAR_ChurchOfLight_Villager_Male",
    "name": "Villager",
    "prefabs": [
      "CHAR_ChurchOfLight_Villager_Male",
      "CHAR_ChurchOfLight_Villager_Male_Servant"
    ],
    "code": null,
    "group": "E"
  },
  {
    "id": "CHAR_Farmlands_Villager_Female",
    "name": "Villager",
    "prefabs": [
      "CHAR_Farmlands_Villager_Female",
      "CHAR_Farmlands_Villager_Female_Servant"
    ],
    "code": null,
    "group": "E"
  },
  {
    "id": "CHAR_Farmlands_Villager_Female_Sister",
    "name": "Villager",
    "prefabs": [
      "CHAR_Farmlands_Villager_Female_Sister",
      "CHAR_Farmlands_Villager_Female_Sister_Servant"
    ],
    "code": null,
    "group": "E"
  },
  {
    "id": "CHAR_Farmlands_Villager_Male",
    "name": "Villager",
    "prefabs": [
      "CHAR_Farmlands_Villager_Male",
      "CHAR_Farmlands_Villager_Male_Servant"
    ],
    "code": null,
    "group": "E"
  },
  {
    "id": "CHAR_Militia_BellRinger",
    "name": "Bell Ringer",
    "prefabs": [
      "CHAR_Militia_BellRinger",
      "CHAR_Militia_BellRinger_Servant"
    ],
    "code": null,
    "group": "E"
  }
];
