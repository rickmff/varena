export type Shard = {
	id: string;
	name: string;
	prefab: string;
	image: string | null;
};

export const SHARDS: Shard[] = [
	{ id: "None", name: "None", prefab: "", image: null },
	{
		id: "Dracula",
		name: "Dracula's Shard",
		prefab: "Item_MagicSource_SoulShard_Dracula",
		image: "/images/shards/draculashard.png",
	},
	{
		id: "Manticore",
		name: "Winged Horror's Shard",
		prefab: "Item_MagicSource_SoulShard_Manticore",
		image: "/images/shards/wingedshard.png",
	},
	{
		id: "Monster",
		name: "Monster's Shard",
		prefab: "Item_MagicSource_SoulShard_Monster",
		image: "/images/shards/adamshard.png",
	},
	{
		id: "Morgana",
		name: "Serpent's Shard",
		prefab: "Item_MagicSource_SoulShard_Morgana",
		image: "/images/shards/serpentshard.png",
	},
	{
		id: "Solarus",
		name: "Solarus' Shard",
		prefab: "Item_MagicSource_SoulShard_Solarus",
		image: "/images/shards/solarusshard.png",
	},
];
