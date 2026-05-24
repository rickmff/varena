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
		name: "Dracula",
		prefab: "Item_MagicSource_SoulShard_Dracula",
		image: "/images/shards/draculashard.png",
	},
	{
		id: "Winged",
		name: "Winged",
		prefab: "Item_MagicSource_SoulShard_Manticore",
		image: "/images/shards/wingedshard.png",
	},
	{
		id: "Monster",
		name: "Monster",
		prefab: "Item_MagicSource_SoulShard_Monster",
		image: "/images/shards/adamshard.png",
	},
	{
		id: "Serpent",
		name: "Serpent",
		prefab: "Item_MagicSource_SoulShard_Morgana",
		image: "/images/shards/serpentshard.png",
	},
	{
		id: "Solarus",
		name: "Solarus",
		prefab: "Item_MagicSource_SoulShard_Solarus",
		image: "/images/shards/solarusshard.png",
	},
];
