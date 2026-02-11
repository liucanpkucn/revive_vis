"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

export function Visualization(props: { width: number; height: number }) {
	const { width, height } = props;
	const svgRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		if (!svgRef.current) return;
		const svg = d3.select(svgRef.current);
		svg.selectAll("*" ).remove();

		const viewBoxWidth = 1331;
		const viewBoxHeight = 1078;
		svg.attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
        svg.attr("font-family", "Arial, Helvetica, sans-serif");
        svg.style("color", "#222");

		// Background
		svg.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", viewBoxWidth)
			.attr("height", viewBoxHeight)
			.attr("fill", "#F9F1E0");

		// Frames
		svg.append("rect") // Outer frame
			.attr("x", 12)
			.attr("y", 12)
			.attr("width", 1307)
			.attr("height", 1054)
			.attr("fill", "none")
			.attr("stroke", "#222")
			.attr("stroke-width", 2);

		svg.append("rect") // Inner frame
			.attr("x", 16)
			.attr("y", 16)
			.attr("width", 1299)
			.attr("height", 1046)
			.attr("fill", "none")
			.attr("stroke", "#222")
			.attr("stroke-width", 1);
		
		// Titles and annotations
		svg.append("text")
			.attr("x", 980)
			.attr("y", 400)
			.attr("font-size", "41px")
			.attr("font-weight", "bold")
			.attr("font-family", "'Times New Roman', Times, serif")
            .style("font-stretch", "condensed")
            .attr("letter-spacing", "-0.5px")
			.text("Fettgehalt der Milch");

		svg.append("text")
			.attr("x", 980)
			.attr("y", 435)
			.attr("font-size", "20px")
			.text("im Durchschnitt der Jahre 1930-1932");

		svg.append("text")
			.attr("x", 70)
			.attr("y", 90)
			.attr("font-size", "18px")
			.attr("font-weight", "bold")
			.text("Deutsches Reich");
		
		svg.append("text")
			.attr("x", 70)
			.attr("y", 112)
			.attr("font-size", "14px")
			.text("Molkereierhebung");

		svg.append("text")
			.attr("x", 1250)
			.attr("y", 40)
			.attr("font-size", "16px")
			.text("Karte 76");
		
		svg.append("text")
			.attr("x", 30)
			.attr("y", 1065)
			.attr("font-size", "12px")
			.attr("font-family", "'Times New Roman', Times, serif")
			.text("Bearbeitet im Statistischen Reichsamt");


		// Legend
		const legendData = [
			{ color: "#FFF5E1", label: "3,0", unit: "vH" },
			{ color: "#FDE0C3", label: "3,1", unit: "\"" },
			{ color: "#FBCBA6", label: "3,2", unit: "\"" },
			{ color: "#F9B689", label: "3,3", unit: "\"" },
			{ color: "#F29D6E", label: "3,4", unit: "\"" },
			{ color: "#EB8454", label: "3,5", unit: "\"" },
			{ color: "#D86A3E", label: "3,6", unit: "\"" },
			{ color: "#C2502A", label: "3,7", unit: "\"" },
			{ color: "#AA3819", label: "3,8", unit: "\"" },
		];

		const legend = svg.append("g")
			.attr("transform", "translate(800, 760)");

		legend.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("font-size", "14px")
			.text("Fettgehalt der Milch in den größeren Verwaltungs-");
		
		legend.append("text")
			.attr("x", 0)
			.attr("y", 22)
			.attr("font-size", "14px")
			.text("bezirken:");

		const legendItems = legend.append("g")
			.attr("transform", "translate(50, 60)"); // Position of the color ramp itself

		legendItems.selectAll("rect")
			.data(legendData)
			.enter()
			.append("rect")
			.attr("x", 0)
			.attr("y", (d, i) => i * 24)
			.attr("width", 65)
			.attr("height", 24)
			.attr("fill", d => d.color)
			.attr("stroke", "#333")
			.attr("stroke-width", 0.75);

		const legendText = legendItems.selectAll("text")
			.data(legendData)
			.enter()
			.append("text")
			.attr("x", 80)
			.attr("y", (d, i) => i * 24 + 17)
			.attr("font-size", "14px");
        
        legendText.append("tspan").text(d => d.label);
        legendText.append("tspan")
            .text(d => ` ${d.unit}`)
            .attr("font-size", d => d.unit === "vH" ? "10px" : "14px")
            .attr("dy", d => d.unit === "vH" ? "-0.1em" : "0");
			
	}, [width, height]);

	return (
		<svg
			ref={svgRef}
			width={width}
			height={height}
			xmlns="http://www.w3.org/2000/svg"
		/>
	);
}