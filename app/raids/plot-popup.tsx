"use client";

import { Ban, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SHARDS, type Shard } from "@/data/shards";

const TIME_OPTIONS = [15, 30, 45, 60, 90, 120];

type Props = {
	plotId: number;
	opponent: string;
	time: number;
	shard: string;
	onOpponentChange: (v: string) => void;
	onTimeChange: (v: number) => void;
	onShardChange: (v: string) => void;
	onClose: () => void;
};

export function PlotPopup({
	plotId,
	opponent,
	time,
	shard,
	onOpponentChange,
	onTimeChange,
	onShardChange,
	onClose,
}: Props) {
	const player = opponent.trim() || "<player>";
	const command = `.raid invite ${player} ${plotId} ${time} ${shard}`;
	const canCopy = opponent.trim().length > 0;
	const selectedShard = SHARDS.find((s) => s.id === shard) ?? SHARDS[0];

	return (
		<div
			className="w-[22rem] rounded-xl border border-zinc-700/70 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur"
			onPointerDown={(e) => e.stopPropagation()}
		>
			<div className="flex items-start justify-between">
				<h3 className="text-xl font-bold tracking-wide text-white">
					PLOT {plotId}
				</h3>
				<button
					type="button"
					onClick={onClose}
					className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
					aria-label="Close"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			<label className="mt-3 flex items-center gap-3">
				<span className="w-20 shrink-0 text-sm text-zinc-300">Opponent</span>
				<Input
					autoFocus
					type="text"
					value={opponent}
					onChange={(e) => onOpponentChange(e.target.value)}
					placeholder="e.g. Nemesis"
					className="flex-1"
				/>
			</label>

			<div className="mt-3 flex items-start gap-3">
				<label className="flex min-w-0 flex-1 items-center gap-2">
					<span className="text-sm text-zinc-300">Time</span>
					<InlineDropdown
						value={String(time)}
						onChange={(v) => onTimeChange(Number(v))}
						trigger={<span className="truncate">{time}min</span>}
						options={TIME_OPTIONS.map((m) => ({
							value: String(m),
							label: <span>{m}min</span>,
						}))}
					/>
				</label>
				<label className="flex min-w-0 flex-1 items-center gap-2">
					<span className="text-sm text-zinc-300">Shard</span>
					<InlineDropdown
						value={shard}
						onChange={onShardChange}
						trigger={<ShardLabel shard={selectedShard} />}
						options={SHARDS.map((s) => ({
							value: s.id,
							label: <ShardLabel shard={s} />,
						}))}
					/>
				</label>
			</div>

			<div className="my-3 h-px bg-zinc-700/50" />

			<input
				readOnly
				value={command}
				className="w-full rounded-md border bg-black/50 px-3 py-2 text-sm text-gray-400"
			/>

			<div className="mt-3 flex justify-end">
				<Button
					type="button"
					disabled={!canCopy}
					onClick={async () => {
						try {
							await navigator.clipboard.writeText(command);
							toast("Raid Command Copied", {
								className: "bg-black text-white",
								description: "Paste in-game chat to send the invite.",
							});
						} catch {
							toast.error("Failed to copy command");
						}
					}}
					className="border-red-900/70 bg-red-900/50 px-3 py-2 text-white transition-colors hover:bg-red-800 disabled:opacity-50 disabled:hover:bg-red-900/50"
				>
					COPY COMMAND
				</Button>
			</div>
		</div>
	);
}

function InlineDropdown({
	value,
	onChange,
	trigger,
	options,
}: {
	value: string;
	onChange: (v: string) => void;
	trigger: React.ReactNode;
	options: { value: string; label: React.ReactNode }[];
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", handler);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<div ref={ref} className="relative min-w-0 flex-1">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex h-9 w-full items-center justify-between gap-2 overflow-hidden rounded-md border border-zinc-700 bg-zinc-950/60 px-2 text-sm text-zinc-200 hover:bg-zinc-900"
			>
				<span className="flex min-w-0 flex-1 items-center gap-2 text-left">
					{trigger}
				</span>
				<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
			</button>
			{open && (
				<div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
					{options.map((o) => (
						<button
							key={o.value}
							type="button"
							onClick={() => {
								onChange(o.value);
								setOpen(false);
							}}
							className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-zinc-800 ${
								o.value === value ? "bg-zinc-800/70" : ""
							}`}
						>
							{o.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function ShardLabel({ shard }: { shard: Shard }) {
	return (
		<>
			{shard.image ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={shard.image}
					alt=""
					className="h-5 w-5 shrink-0 rounded-sm object-contain"
					onError={(e) => {
						(e.currentTarget as HTMLImageElement).style.display = "none";
					}}
				/>
			) : (
				<Ban className="h-5 w-5 shrink-0 text-zinc-500" />
			)}
			<span className="min-w-0 flex-1 truncate">{shard.name}</span>
		</>
	);
}
