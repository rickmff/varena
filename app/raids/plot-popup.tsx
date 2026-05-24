"use client";

import { Ban, ChevronDown, Copy, X } from "lucide-react";
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
			className="w-[22rem] rounded-xl border border-white/10 bg-zinc-950 p-4 shadow-2xl transition-all duration-300 sm:p-5"
			onPointerDown={(e) => e.stopPropagation()}
		>
			<div className="mb-4 flex items-center gap-3">
				<div className="h-6 w-1 rounded-full bg-gradient-to-b from-green-400 to-green-600" />
				<h3 className="text-lg font-bold tracking-wide text-grey-100">
					PLOT #{plotId}
				</h3>
				<div className="h-px flex-1 bg-gradient-to-r from-grey-600 to-transparent" />
				<button
					type="button"
					onClick={onClose}
					className="rounded-md border border-white/10 bg-white/5 p-1 text-zinc-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
					aria-label="Close"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			<label className="flex items-center gap-2">
				<span className="shrink-0 text-sm font-medium text-zinc-300">Opponent</span>
				<Input
					autoFocus
					type="text"
					value={opponent}
					onChange={(e) => onOpponentChange(e.target.value)}
					placeholder="e.g. Nemesis"
					className="h-9 flex-1 border-white/10 bg-white/[0.025] text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-sky-500/40"
				/>
			</label>

			<div className="mt-3 grid grid-cols-[0.85fr_1.1fr] items-start gap-3">
				<label className="flex min-w-0 items-center gap-2">
					<span className="text-sm font-medium text-zinc-300">Time</span>
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
				<label className="flex min-w-0 items-center gap-2">
					<span className="text-sm font-medium text-zinc-300">Shard</span>
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

			<input
				readOnly
				value={command}
				className="mt-3 w-full rounded-md bg-white/[0.025] px-4 py-2 text-center font-mono text-sm text-gray-300 focus:outline-none"
			/>

			<div className="mt-4 flex justify-end">
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
					className="w-full border border-red-900/70 bg-red-900/50 px-3 py-2 text-white transition-colors hover:bg-red-800 disabled:opacity-50 disabled:hover:bg-red-900/50"
				>
					<Copy className="mr-2 h-4 w-4" />
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
				className="flex h-9 w-full items-center justify-between gap-2 overflow-hidden rounded-md border border-white/10 bg-white/[0.025] px-2 text-sm text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
			>
				<span className="flex min-w-0 flex-1 items-center gap-2 text-left">
					{trigger}
				</span>
				<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
			</button>
			{open && (
				<div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-md border border-white/10 bg-zinc-950 p-1 shadow-xl">
					{options.map((o) => (
						<button
							key={o.value}
							type="button"
							onClick={() => {
								onChange(o.value);
								setOpen(false);
							}}
							className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-zinc-200 hover:bg-white/10 ${
								o.value === value ? "bg-white/10" : ""
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
