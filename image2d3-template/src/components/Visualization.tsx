"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

export function Visualization(props: { width: number; height: number }) {
	const { width, height } = props;
	const svgRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		if (!svgRef.current) return;
		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		// TODO: Implement pixel-perfect D3 reconstruction here.
		// Tips:
		// - Use the same coordinate system as the reference: (0..width, 0..height)
		// - Prefer explicit numbers for positions/sizes to match pixels
		// - Keep all styling inside SVG (fill/stroke/font) to stabilize rendering

		// Placeholder crosshair (delete once you start implementing)
		svg
			.append("line")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", width)
			.attr("y2", height)
			.attr("stroke", "#e5e7eb")
			.attr("stroke-width", 1);
		svg
			.append("line")
			.attr("x1", width)
			.attr("y1", 0)
			.attr("x2", 0)
			.attr("y2", height)
			.attr("stroke", "#e5e7eb")
			.attr("stroke-width", 1);
	}, [width, height]);

	return (
		<svg
			ref={svgRef}
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
		/>
	);
}
