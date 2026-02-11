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

		// Overall dimensions
		const viewBoxWidth = 1080;
		const viewBoxHeight = 1420;
		
		svg.attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
		   .attr("font-family", "sans-serif")
           .style("background-color", "#FDF5E6");

        // Add a rect for the background color
        svg.append("rect")
            .attr("width", viewBoxWidth)
            .attr("height", viewBoxHeight)
            .attr("fill", "#FDF5E6");

		// Global Title and Headers
		svg.append("text")
			.attr("x", viewBoxWidth / 2)
			.attr("y", 60)
			.attr("text-anchor", "middle")
			.attr("font-size", "24px")
			.attr("font-family", "serif")
			.text("NEGRO POPULATION BY AGE AND SEX: 1900");

		svg.append("text")
			.attr("x", viewBoxWidth - 50)
			.attr("y", 40)
			.attr("text-anchor", "end")
			.attr("font-size", "14px")
			.attr("font-family", "serif")
			.text("PLATE No. 39");
            
        // Footer
        svg.append("text")
            .attr("x", viewBoxWidth - 50)
            .attr("y", viewBoxHeight - 20)
            .attr("text-anchor", "end")
            .attr("font-size", "10px")
            .attr("font-family", "serif")
            .text("JULIUS BIEN & CO. LITH. N.Y.");

		// Grid layout
		const grid = {
			rows: 7,
			cols: 4,
			x: 100,
			y: 120,
			width: 940,
			height: 1260,
		};
		const cellWidth = grid.width / grid.cols;
		const cellHeight = grid.height / grid.rows;

		// Data
		const ageGroups = ["80-90", "70-80", "60-70", "50-60", "40-50", "30-40", "20-30", "10-20", "0-10"];
		const states = [
			"ALABAMA", "ARIZONA", "ARKANSAS", "CALIFORNIA",
			"COLORADO", "CONNECTICUT", "DELAWARE", "DISTRICT OF COLUMBIA",
			"FLORIDA", "GEORGIA", "HAWAII", "IDAHO",
			"ILLINOIS", "INDIANA", "INDIAN TERRITORY", "IOWA",
			"KANSAS", "KENTUCKY", "LOUISIANA", "MAINE",
			"MARYLAND", "MASSACHUSETTS", "MICHIGAN", "MINNESOTA",
			"MISSISSIPPI", "MISSOURI", "MONTANA", "NEBRASKA",
		];
		const alabamaData = [
			{ age: "80-90", male: 0.2, female: 0.2 }, { age: "70-80", male: 0.5, female: 0.5 },
			{ age: "60-70", male: 1.0, female: 1.0 }, { age: "50-60", male: 2.0, female: 2.0 },
			{ age: "40-50", male: 3.5, female: 3.5 }, { age: "30-40", male: 5.0, female: 5.0 },
			{ age: "20-30", male: 8.0, female: 9.0 }, { age: "10-20", male: 12.0, female: 13.0 },
			{ age: "0-10", male: 15.0, female: 15.0 },
		];

        const plotArea = {
            top: 40,
            bottom: cellHeight - 40,
            height: cellHeight - 80,
        }

		// Y axis labels
		for(let i = 0; i < grid.rows; i++) {
            const yAxisG = svg.append("g").attr("transform", `translate(${grid.x - 10}, ${grid.y + i * cellHeight})`);
            const yScaleForLabels = d3.scaleBand().domain(ageGroups).range([plotArea.top, plotArea.bottom]).padding(0.1);
            
            yAxisG.append("text").text("AGES").attr("y", plotArea.top - 10).attr("x", -20).attr("text-anchor", "start").attr("font-size", "10px");
            ageGroups.forEach(age => {
                yAxisG.append("text").text(age).attr("y", yScaleForLabels(age) + yScaleForLabels.bandwidth()/2).attr("x", -20).attr("text-anchor", "start").attr("font-size", "8px").attr("dominant-baseline", "middle");
            });
            yAxisG.append("text").text("PER CENT").attr("y", plotArea.bottom + 20).attr("x", -20).attr("text-anchor", "start").attr("font-size", "10px");
        }


		// Create small multiples
		states.forEach((state, i) => {
			const row = Math.floor(i / grid.cols);
			const col = i % grid.cols;
			const g = svg.append("g").attr("transform", `translate(${grid.x + col * cellWidth}, ${grid.y + row * cellHeight})`);

			// State title
			g.append("text")
				.attr("x", cellWidth / 2)
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.attr("font-size", "10px")
				.text(state);

			// Scales
			const xScale = d3.scaleLinear().domain([0, 15]).range([0, cellWidth / 2 - 20]);
			const yScale = d3.scaleBand().domain(ageGroups).range([plotArea.top, plotArea.bottom]).padding(0.1);

			// Grid lines and x-axis labels
			const xTicks = [0, 5, 10, 15];
			xTicks.forEach(tick => {
				g.append("line").attr("x1", cellWidth / 2 + xScale(tick)).attr("x2", cellWidth / 2 + xScale(tick))
					.attr("y1", plotArea.top).attr("y2", plotArea.bottom).attr("stroke", "#000").attr("stroke-width", 0.5);
				g.append("line").attr("x1", cellWidth / 2 - xScale(tick)).attr("x2", cellWidth / 2 - xScale(tick))
					.attr("y1", plotArea.top).attr("y2", plotArea.bottom).attr("stroke", "#000").attr("stroke-width", 0.5);
				
                g.append("text").text(tick).attr("x", cellWidth / 2 + xScale(tick)).attr("y", plotArea.bottom + 15).attr("font-size", "8px").attr("text-anchor", "middle");
                g.append("text").text(tick).attr("x", cellWidth / 2 - xScale(tick)).attr("y", plotArea.bottom + 15).attr("font-size", "8px").attr("text-anchor", "middle");
			});

			// Bars
			alabamaData.forEach(d => {
				g.append("rect")
					.attr("x", cellWidth / 2 - xScale(d.male))
					.attr("y", yScale(d.age))
					.attr("width", xScale(d.male))
					.attr("height", yScale.bandwidth())
					.attr("fill", "white")
                    .attr("stroke", "black");

				g.append("rect")
					.attr("x", cellWidth / 2)
					.attr("y", yScale(d.age))
					.attr("width", xScale(d.female))
					.attr("height", yScale.bandwidth())
					.attr("fill", "white")
                    .attr("stroke", "black");
			});

            // MALES/FEMALES labels
            g.append("text").text("MALES").attr("x", cellWidth/2 - 45).attr("y", plotArea.top).attr("font-size", "8px").attr("transform", `rotate(-45, ${cellWidth/2 - 45}, ${plotArea.top})`);
            g.append("text").text("FEMALES").attr("x", cellWidth/2 + 45).attr("y", plotArea.top).attr("font-size", "8px").attr("transform", `rotate(45, ${cellWidth/2 + 45}, ${plotArea.top})`);
		});

	}, [width, height]);

	return (
		<svg ref={svgRef} width={width} height={height} />
	);
}
