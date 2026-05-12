"use client";

import "@/components/vbuilds/styles.css";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Copy, Shield, Swords, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { servants, type Servant } from "@/data/servants";
import { MapCanvas } from "./map-canvas";

type TabValue = "attackers" | "defenders";

const SLOT_COUNT = 8;
const EMPTY_SLOT_CODE = "0";

export function RaidsClient() {
	const [activeTab, setActiveTab] = useState<TabValue>("attackers");
	const [slots, setSlots] = useState<(string | null)[]>(() =>
		Array(SLOT_COUNT).fill(null),
	);

	const servantById = useMemo(
		() => new Map(servants.map((s) => [s.id, s])),
		[],
	);

	const command = useMemo(() => {
		const code = slots
			.map((id) => {
				if (!id) return EMPTY_SLOT_CODE;
				const s = servantById.get(id);
				return s?.code ?? EMPTY_SLOT_CODE;
			})
			.join("");
		return `.set-servants ${code}`;
	}, [slots, servantById]);

	const addServant = (servant: Servant) => {
		setSlots((prev) => {
			const idx = prev.indexOf(null);
			if (idx === -1) {
				toast("All 8 slots are full", {
					description: "Clear a slot to add another servant.",
				});
				return prev;
			}
			const next = [...prev];
			next[idx] = servant.id;
			return next;
		});
	};

	const clearSlot = (idx: number) => {
		setSlots((prev) => {
			const next = [...prev];
			next[idx] = null;
			return next;
		});
	};

	const clearAll = () => setSlots(Array(SLOT_COUNT).fill(null));

	const copyCommand = async () => {
		try {
			await navigator.clipboard.writeText(command);
			toast("Servant Command Copied", {
				className: "bg-black text-white",
				description: "Paste in-game chat to set your raid party.",
			});
		} catch {
			toast.error("Failed to copy command");
		}
	};

	return (
		<Tabs
			value={activeTab}
			onValueChange={(v) => setActiveTab(v as TabValue)}
			className="w-full"
		>
			<div className="mb-6 flex justify-center">
				<TabsList className="grid h-fit w-full max-w-md grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/60 p-1.5 shadow-lg backdrop-blur-sm">
					<TabTrigger value="attackers" active={activeTab === "attackers"}>
						<Swords className="h-4 w-4" />
						<span>ATTACKERS</span>
					</TabTrigger>
					<TabTrigger value="defenders" active={activeTab === "defenders"}>
						<Shield className="h-4 w-4" />
						<span>DEFENDERS</span>
					</TabTrigger>
				</TabsList>
			</div>

			<TabsContent value="attackers">
				<MapCanvas />
			</TabsContent>

			<TabsContent value="defenders">
				<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
						{servants.map((servant) => {
							const disabled = !servant.code;
							return (
								<button
									key={servant.id}
									type="button"
									disabled={disabled}
									onClick={() => addServant(servant)}
									className="build-spellSchool build-spellSchool-empty group relative overflow-hidden rounded-lg border text-left transition-all duration-200 hover:shadow-lg hover:shadow-indigo-900/50 disabled:cursor-not-allowed disabled:opacity-40"
									title={disabled ? "No code available for this servant" : `Add ${servant.name}`}
								>
									<div className="relative aspect-square">
										<Image
											src={`/images/servants/${servant.id}.png`}
											alt={servant.name}
											fill
											sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
											className="object-contain"
										/>
									</div>
									<div className="border-t border-zinc-700/50 bg-zinc-900/40 px-2 py-1.5 text-center text-xs font-medium text-zinc-300 group-hover:text-white">
										{servant.name}
									</div>
								</button>
							);
						})}
					</div>

					<aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
						<section className="rounded-xl border border-grey-700/50 bg-grey-900/40 p-4 shadow-2xl transition-all duration-300 hover:border-grey-600/50 sm:p-6">
							<div className="mb-4 flex items-center gap-3 sm:mb-6">
								<div className="h-6 w-1 rounded-full bg-gradient-to-b from-green-400 to-green-600" />
								<h3 className="text-lg font-bold tracking-wide text-grey-100 sm:text-xl">
									SERVANTS
								</h3>
								<div className="h-px flex-1 bg-gradient-to-r from-grey-600 to-transparent" />
								<button
									type="button"
									onClick={clearAll}
									disabled={slots.every((s) => s === null)}
									className="text-xs uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
								>
									Clear
								</button>
							</div>

							<div className="grid grid-cols-4 gap-2 rounded-lg bg-zinc-900 p-2">
								{slots.map((id, idx) => {
									const servant = id ? servantById.get(id) : null;
									return (
										<button
											key={idx}
											type="button"
											onClick={() => clearSlot(idx)}
											disabled={!servant}
											className="group relative aspect-square overflow-hidden rounded-md bg-black/40 transition-colors hover:bg-black/60 disabled:hover:bg-black/40"
											title={servant ? `Remove ${servant.name}` : "Empty slot"}
										>
											{servant ? (
												<>
													<Image
														src={`/images/servants/${servant.id}.png`}
														alt={servant.name}
														fill
														sizes="80px"
														className="object-contain"
													/>
													<div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
														<X className="h-4 w-4 text-white" />
													</div>
												</>
											) : (
												<div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
													{idx + 1}
												</div>
											)}
										</button>
									);
								})}
							</div>
						</section>

						<section className="rounded-xl border border-grey-700/50 bg-grey-900/40 p-4 shadow-2xl transition-all duration-300 hover:border-grey-600/50 sm:p-6">
							<div className="mb-4 flex items-center gap-3 sm:mb-6">
								<div className="h-6 w-1 rounded-full bg-gradient-to-b from-teal-400 to-teal-600" />
								<h3 className="text-lg font-bold tracking-wide text-grey-100 sm:text-xl">
									COMMAND
								</h3>
								<div className="h-px flex-1 bg-gradient-to-r from-grey-600 to-transparent" />
							</div>

							<div className="space-y-3">
								<input
									readOnly
									value={command}
									className="w-full rounded-md bg-black/50 px-4 py-2 text-center font-mono text-sm text-gray-400 focus:outline-none"
								/>
								<Button
									onClick={copyCommand}
									className="w-full border border-red-900/70 bg-red-900/50 text-white transition-colors hover:bg-red-800"
								>
									<Copy className="mr-2 h-4 w-4" />
									COPY COMMAND
								</Button>
							</div>
						</section>
					</aside>
				</div>
			</TabsContent>
		</Tabs>
	);
}

function TabTrigger({
	value,
	active,
	children,
}: {
	value: string;
	active: boolean;
	children: React.ReactNode;
}) {
	return (
		<TabsTrigger
			value={value}
			className="relative z-0 w-full rounded-md bg-transparent px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-gray-400 transition-colors duration-300 hover:bg-white/5 hover:text-white data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
		>
			{active && (
				<motion.div
					layoutId="raids-active-tab-bg"
					className="absolute inset-0 z-[-1] rounded-md border border-red-700/30 bg-gradient-to-r from-red-900/70 to-red-800/50 shadow-lg shadow-red-900/30"
					initial={false}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
				/>
			)}
			<div className="relative z-10 flex items-center justify-center gap-2">
				{children}
			</div>
		</TabsTrigger>
	);
}
