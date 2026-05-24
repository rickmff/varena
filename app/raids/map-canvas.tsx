"use client";

import { useEffect, useRef, useState } from "react";
import { RAIDABLE_PLOTS } from "@/data/raidable-plots";
import { PlotPopup } from "./plot-popup";

type Ring = [number, number][];
type Territory = {
  id: number;
  region: string | null;
  rings: Ring[];
  center: [number, number];
};
type Data = {
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  territories: Territory[];
};

const MAP_PX = 6080;

const DEFAULT_SCALE = 1.001;
const DEFAULT_OFFSET_X = -640;
const DEFAULT_OFFSET_Y = -23;
const DEFAULT_FLIP_X = false;
const DEFAULT_FLIP_Y = true;

const REGION_COLOR: Record<string, string> = {
  FarbaneWoods: "#7a8e3c",
  DunleyFarmlands: "#c9a85e",
  HallowedMountains: "#7da7c9",
  CursedForest: "#5c4a78",
  SilverlightHills: "#d6c47e",
  Gloomrot_North: "#7d6b8c",
  Gloomrot_South: "#a6557e",
  Strongblade: "#9c5240",
};

const SELECTED_COLOR = "#4ade80";

const POPUP_W = 352; // matches w-[22rem] in PlotPopup
const POPUP_H = 280;

export function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Data | null>(null);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [offsetX, setOffsetX] = useState(DEFAULT_OFFSET_X);
  const [offsetY, setOffsetY] = useState(DEFAULT_OFFSET_Y);
  const [debug, setDebug] = useState(false);

  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [hoveredPlot, setHoveredPlot] = useState<number | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [opponent, setOpponent] = useState("");
  const [time, setTime] = useState(30);
  const [shard, setShard] = useState("None");

  const closePopup = () => {
    setSelectedPlot(null);
    setPopupPos(null);
  };
  const [highlight, setHighlight] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [flipX, setFlipX] = useState(DEFAULT_FLIP_X);
  const [flipY, setFlipY] = useState(DEFAULT_FLIP_Y);

  const [viewScale, setViewScale] = useState(1);
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    startOffX: number;
    startOffY: number;
    startViewX: number;
    startViewY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).has("debug"));
  }, []);

  useEffect(() => {
    fetch("/data/territories.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, MAP_PX, MAP_PX);

    const cx = (data.bounds.minX + data.bounds.maxX) / 2;
    const cy = (data.bounds.minY + data.bounds.maxY) / 2;

    for (const terr of data.territories) {
      if (!RAIDABLE_PLOTS.has(terr.id)) continue;
      const isSelected = selectedPlot === terr.id;
      const isHovered = !isSelected && hoveredPlot === terr.id;
      if (isSelected) {
        ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
        ctx.shadowBlur = 40;
        ctx.fillStyle = "rgba(34, 197, 94, 0.6)";
        ctx.strokeStyle = SELECTED_COLOR;
        ctx.lineWidth = 6;
      } else if (isHovered) {
        ctx.shadowColor = "rgba(64, 220, 255, 0.95)";
        ctx.shadowBlur = 40;
        ctx.fillStyle = "rgba(64, 220, 255, 0.55)";
        ctx.strokeStyle = "#6ee7ff";
        ctx.lineWidth = 6;
      } else if (highlight) {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 30, 30, 0.55)";
        ctx.strokeStyle = "#ff1e1e";
        ctx.lineWidth = 6;
      } else {
        ctx.shadowColor = "rgba(0, 194, 255, 0.75)";
        ctx.shadowBlur = 28;
        ctx.fillStyle = "rgba(0, 194, 255, 0.42)";
        ctx.strokeStyle = "#00c2ff";
        ctx.lineWidth = 6;
      }

      ctx.beginPath();
      for (const ring of terr.rings) {
        for (let i = 0; i < ring.length; i++) {
          const [wxRaw, wyRaw] = ring[i];
          const wx = flipX ? 2 * cx - wxRaw : wxRaw;
          const wy = flipY ? 2 * cy - wyRaw : wyRaw;
          const x = scale * wx + offsetX;
          const y = scale * wy + offsetY;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }
      ctx.fill("evenodd");
      ctx.stroke();
    }

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    if (showLabels) {
      ctx.font = "bold 80px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 8;
      ctx.lineJoin = "round";

      for (const terr of data.territories) {
        if (!RAIDABLE_PLOTS.has(terr.id)) continue;
        const [wxRaw, wyRaw] = terr.center;
        const wx = flipX ? 2 * cx - wxRaw : wxRaw;
        const wy = flipY ? 2 * cy - wyRaw : wyRaw;
        const x = scale * wx + offsetX;
        const y = scale * wy + offsetY;
        const label = String(terr.id);
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.fillStyle = "white";
        ctx.strokeText(label, x, y);
        ctx.fillText(label, x, y);
      }
    }
  }, [
    data,
    scale,
    offsetX,
    offsetY,
    highlight,
    flipX,
    flipY,
    showLabels,
    selectedPlot,
    hoveredPlot,
  ]);

  const zoomAroundPoint = (newScale: number, px: number, py: number) => {
    const k = newScale / scale;
    setOffsetX(Math.round(px - k * (px - offsetX)));
    setOffsetY(Math.round(py - k * (py - offsetY)));
    setScale(Number(newScale.toFixed(4)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !debug) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const r = MAP_PX / rect.width;
      const px = (e.clientX - rect.left) * r;
      const py = (e.clientY - rect.top) * r;
      const factor = e.deltaY < 0 ? 1.02 : 1 / 1.02;
      zoomAroundPoint(scale * factor, px, py);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debug, scale, offsetX, offsetY]);

  // View zoom (CSS scale around cursor) — normal mode
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer || debug) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = outer.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const next = Math.max(1, Math.min(5, viewScale * factor));
      if (next === viewScale) return;
      if (next === 1) {
        setViewX(0);
        setViewY(0);
      } else {
        const ratio = next / viewScale;
        setViewX(px - (px - viewX) * ratio);
        setViewY(py - (py - viewY) * ratio);
      }
      setViewScale(next);
    };
    outer.addEventListener("wheel", onWheel, { passive: false });
    return () => outer.removeEventListener("wheel", onWheel);
  }, [debug, viewScale, viewX, viewY]);

  const hitTest = (clientX: number, clientY: number): number | null => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return null;
    const rect = canvas.getBoundingClientRect();
    const r = MAP_PX / rect.width;
    const px = (clientX - rect.left) * r;
    const py = (clientY - rect.top) * r;

    const cxw = (data.bounds.minX + data.bounds.maxX) / 2;
    const cyw = (data.bounds.minY + data.bounds.maxY) / 2;

    // Inverse transform: pixel -> rendered world -> raw world (undo flip)
    const renderedWx = (px - offsetX) / scale;
    const renderedWy = (py - offsetY) / scale;
    const wx = flipX ? 2 * cxw - renderedWx : renderedWx;
    const wy = flipY ? 2 * cyw - renderedWy : renderedWy;

    for (const terr of data.territories) {
      if (!RAIDABLE_PLOTS.has(terr.id)) continue;
      for (const ring of terr.rings) {
        if (pointInRing(wx, wy, ring)) return terr.id;
      }
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffX: offsetX,
      startOffY: offsetY,
      startViewX: viewX,
      startViewY: viewY,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) {
      const hit = hitTest(e.clientX, e.clientY);
      if (hit !== hoveredPlot) setHoveredPlot(hit);
      return;
    }
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!dragRef.current.moved && Math.hypot(dx, dy) > 4) {
      dragRef.current.moved = true;
    }
    if (!dragRef.current.moved) return;
    if (debug) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ratio = MAP_PX / canvas.clientWidth;
      setOffsetX(Math.round(dragRef.current.startOffX + dx * ratio));
      setOffsetY(Math.round(dragRef.current.startOffY + dy * ratio));
    } else if (viewScale > 1) {
      setViewX(dragRef.current.startViewX + dx);
      setViewY(dragRef.current.startViewY + dy);
    }
  };

  const onPointerLeave = () => {
    setHoveredPlot(null);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const wasClick = dragRef.current && !dragRef.current.moved;
    dragRef.current = null;
    if (!wasClick) return;
    const hit = hitTest(e.clientX, e.clientY);
    if (hit === null) {
      closePopup();
      return;
    }
    setSelectedPlot(hit);
    const outer = outerRef.current;
    if (!outer) return;
    const rect = outer.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    let px = cx + 16;
    let py = cy + 16;
    if (px + POPUP_W > rect.width - 8) px = cx - POPUP_W - 16;
    if (py + POPUP_H > rect.height - 8) py = cy - POPUP_H - 16;
    if (px < 8) px = 8;
    if (py < 8) py = 8;
    setPopupPos({ x: px, y: py });
  };

  const snippet =
    `const DEFAULT_SCALE = ${scale.toFixed(4)};\n` +
    `const DEFAULT_OFFSET_X = ${offsetX};\n` +
    `const DEFAULT_OFFSET_Y = ${offsetY};\n` +
    `const DEFAULT_FLIP_X = ${flipX};\n` +
    `const DEFAULT_FLIP_Y = ${flipY};`;

  return (
    <div className="relative">
      <section
        className="mx-auto max-w-full rounded-xl border border-white/10 bg-grey-900/40 p-1.5 shadow-2xl transition-all duration-300 hover:border-white/15"
        style={{ width: "min(100%, calc(100vh - 12rem))" }}
      >
        <div
          ref={outerRef}
          className="relative mx-auto aspect-square w-full overflow-hidden rounded-lg border border-white/10 bg-black/30 shadow-[inset_0_0_36px_rgba(0,0,0,0.45)]"
        >
          <div className="pointer-events-none absolute inset-0 z-10 rounded-lg ring-1 ring-inset ring-white/5" />
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${viewX}px, ${viewY}px) scale(${viewScale})`,
            transformOrigin: "0 0",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/map/vr-map-preview.webp')" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/map/vr-map.webp"
            alt="V Rising map"
            className="absolute inset-0 h-full w-full select-none"
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            width={MAP_PX}
            height={MAP_PX}
            className={`absolute inset-0 h-full w-full ${
              debug
                ? "cursor-grab active:cursor-grabbing"
                : viewScale > 1
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-pointer"
            }`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerLeave}
          />
        </div>

        {!debug && viewScale > 1 && (
          <button
            type="button"
            onClick={() => {
              setViewScale(1);
              setViewX(0);
              setViewY(0);
            }}
            className="absolute right-3 top-3 rounded-md border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-xs font-mono text-zinc-200 backdrop-blur hover:bg-zinc-800"
          >
            {viewScale.toFixed(1)}× · reset
          </button>
        )}

        {selectedPlot !== null && popupPos && (
          <div
            className="absolute z-20"
            style={{ left: popupPos.x, top: popupPos.y }}
          >
            <PlotPopup
              plotId={selectedPlot}
              opponent={opponent}
              time={time}
              shard={shard}
              onOpponentChange={setOpponent}
              onTimeChange={setTime}
              onShardChange={setShard}
              onClose={closePopup}
            />
          </div>
        )}
        </div>
      </section>

      {debug && (
        <div className="fixed bottom-4 left-4 z-10 w-80 space-y-3 rounded border border-zinc-700 bg-zinc-900/95 p-4 font-mono text-xs text-zinc-200 shadow-lg">
          <div className="text-zinc-400">
            calibration · drag canvas to pan · scroll to zoom
          </div>

          <Slider
            label="scale"
            value={scale}
            min={0.3}
            max={2}
            step={0.001}
            onChange={(v) => zoomAroundPoint(v, MAP_PX / 2, MAP_PX / 2)}
          />
          <Slider
            label="offsetX"
            value={offsetX}
            min={-3000}
            max={3000}
            step={1}
            onChange={setOffsetX}
          />
          <Slider
            label="offsetY"
            value={offsetY}
            min={-3000}
            max={3000}
            step={1}
            onChange={setOffsetY}
          />

          <div className="flex flex-col gap-1">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={highlight}
                onChange={(e) => setHighlight(e.target.checked)}
              />
              <span>highlight (bright red)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              <span>plot numbers</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={flipX}
                onChange={(e) => setFlipX(e.target.checked)}
              />
              <span>flip horizontally</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={flipY}
                onChange={(e) => setFlipY(e.target.checked)}
              />
              <span>flip vertically</span>
            </label>
          </div>

          <pre className="overflow-x-auto rounded bg-zinc-800 p-2 text-[10px] leading-relaxed">
            {snippet}
          </pre>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded bg-zinc-800 py-1 hover:bg-zinc-700"
              onClick={() => navigator.clipboard.writeText(snippet)}
            >
              copy
            </button>
            <button
              type="button"
              className="flex-1 rounded bg-zinc-800 py-1 hover:bg-zinc-700"
              onClick={() => {
                setScale(DEFAULT_SCALE);
                setOffsetX(DEFAULT_OFFSET_X);
                setOffsetY(DEFAULT_OFFSET_Y);
                setFlipX(DEFAULT_FLIP_X);
                setFlipY(DEFAULT_FLIP_Y);
              }}
            >
              reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function pointInRing(x: number, y: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums">{value.toFixed(step < 1 ? 3 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
