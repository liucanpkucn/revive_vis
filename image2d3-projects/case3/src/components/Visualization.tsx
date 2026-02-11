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

        // Background
		svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "white");

        // Main border
        svg.append("rect")
            .attr("x", 40)
            .attr("y", 70)
            .attr("width", 1110)
            .attr("height", 880)
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .attr("fill", "none");

        // Header divider
        svg.append("line")
            .attr("x1", 40)
            .attr("y1", 170)
            .attr("x2", 1150)
            .attr("y2", 170)
            .attr("stroke", "black")
            .attr("stroke-width", 5);

        // Header text
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 135)
            .attr("text-anchor", "middle")
            .attr("font-family", "Impact, Arial Black, sans-serif")
            .attr("font-size", "80px")
            .attr("letter-spacing", "0.2em")
            .text("T E L E F A C T");
        
        svg.append("text")
            .attr("x", 60)
            .attr("y", 220)
            .attr("font-family", "Futura, Trebuchet MS, sans-serif")
            .attr("font-size", "40px")
            .text("CANADA'S NATIONAL INCOME");

        const data = [
            { year: 1929, value: 5149, label: "5,149 MILLION CANADIAN DOLLARS" },
            { year: 1933, value: 2795, label: "2,795 MILLION" },
            { year: 1937, value: 4342, label: "4,342 MILLION" },
            { year: 1940, value: 4800, label: "4,800 MILLION" },
        ];

        const yPositions = [340, 520, 700, 880];
        const iconWidth = 60;
        const iconHeight = 70;
        const iconSpacing = 10;
        const groupGap = 40;
        const iconsStartX = 150;
        const iconUnit = 500;

        // Year and data labels
        svg.selectAll(".year-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "year-label")
            .attr("x", 60)
            .attr("y", (d, i) => yPositions[i] - 20)
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "30px")
            .attr("font-weight", "bold")
            .text(d => d.year);
        
        svg.selectAll(".data-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "data-label")
            .attr("x", 150)
            .attr("y", (d, i) => yPositions[i] + 50)
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "24px")
            .text(d => d.label);
        
        // Footer
        svg.append("text")
            .attr("x", 1140)
            .attr("y", 940)
            .attr("text-anchor", "end")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "18px")
            .text("SCIENCE SERVICE-PICTOGRAPH CORPORATION 9-16");
        
        // Icon definition
        const iconPath = "M0,15 L25,0 L85,0 L60,15 L60,65 L35,80 L0,65 Z";
        const iconStrokePath = "M25,0 L25,65 L0,65 M60,15 L85,0";

        const defs = svg.append("defs");

        // Data rendering
        data.forEach((d, i) => {
            const numIcons = d.value / iconUnit;
            const fullIcons = Math.floor(numIcons);
            const remainder = numIcons - fullIcons;

            for (let j = 0; j < Math.ceil(numIcons); j++) {
                const x = iconsStartX + j * (iconWidth + iconSpacing) + Math.floor(j / 5) * groupGap;
                const y = yPositions[i] - iconHeight;

                const g = svg.append("g").attr("transform", `translate(${x}, ${y})`);

                const iconGroup = g.append("g");

                if (j >= fullIcons) {
                    const clipId = `clip-${i}-${j}`;
                    defs.append("clipPath")
                        .attr("id", clipId)
                        .append("rect")
                        .attr("width", iconWidth * remainder)
                        .attr("height", iconHeight + 20);
                    iconGroup.attr("clip-path", `url(#${clipId})`);
                }

                iconGroup.append("path")
                    .attr("d", iconPath)
                    .attr("fill", "black");
                
                iconGroup.append("path")
                    .attr("d", iconStrokePath)
                    .attr("fill", "none")
                    .attr("stroke", "white")
                    .attr("stroke-width", 2);
            }
        });

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