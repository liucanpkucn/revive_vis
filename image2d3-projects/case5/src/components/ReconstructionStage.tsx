"use client";

import { REFERENCE } from "@/lib/reference";
import { useMemo, useState } from "react";
import { Visualization } from "@/components/Visualization";

export function ReconstructionStage() {
	// NOTE: render.py navigates with ?screenshot=1. In that mode we must NOT include
	// the reference overlay in the screenshot, otherwise diff.png/MAE/RMSE become meaningless.
	const isScreenshot = useMemo(() => {
		if (typeof window === "undefined") return false;
		return new URLSearchParams(window.location.search).get("screenshot") === "1";
	}, []);

	const [showReference, setShowReference] = useState(!isScreenshot);
	const [opacity, setOpacity] = useState(0.35);

	const stageStyle = useMemo(
		() => ({
			width: `${REFERENCE.width}px`,
			height: `${REFERENCE.height}px`,
		}),
		[],
	);

	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 font-sans">
			<div className="mx-auto max-w-[1200px] space-y-4">
				<header className="space-y-1">
					<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
						Image2D3 Reconstruction
					</h1>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Goal: pixel-aligned D3 reconstruction of <code>public/reference.png</code>.
					</p>
				</header>

				<section className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
						<input
							type="checkbox"
							checked={showReference}
							onChange={(e) => setShowReference(e.target.checked)}
						/>
						Show reference overlay
					</label>

					<label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
						<span className="whitespace-nowrap">Opacity</span>
						<input
							type="range"
							min={0}
							max={1}
							step={0.01}
							value={opacity}
							onChange={(e) => setOpacity(Number(e.target.value))}
							className="w-56"
						/>
						<span className="tabular-nums">{opacity.toFixed(2)}</span>
					</label>

					<div className="text-xs text-zinc-500 dark:text-zinc-400">
						Canvas: {REFERENCE.width}×{REFERENCE.height}
					</div>
				</section>

				<section
					id="reconstruction-container"
					className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
					style={stageStyle}
				>
					<Visualization width={REFERENCE.width} height={REFERENCE.height} />
					{showReference ? (
						<img
							src={REFERENCE.path}
							alt="reference"
							className="pointer-events-none absolute left-0 top-0 h-full w-full select-none"
							style={{ opacity }}
						/>
					) : null}
				</section>
			</div>
		</main>
	);
}
