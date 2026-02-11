"use client";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

type DataRow = {
    ageGroup: string;
    male: number[];
    female: number[];
};

const data: DataRow[] = [
    { ageGroup: "OVER 65", male: [4, 66, 30], female: [6, 36, 58] },
    { ageGroup: "55-65", male: [5, 76, 19], female: [8, 50, 42] },
    { ageGroup: "45-55", male: [9, 81, 10], female: [11, 63, 26] },
    { ageGroup: "35-45", male: [12, 82, 6], female: [13, 72, 15] },
    { ageGroup: "30-35", male: [19, 77, 4], female: [16, 75, 9] },
    { ageGroup: "25-30", male: [34, 63, 3], female: [29, 66, 5] },
    { ageGroup: "20-25", male: [71, 28, 1], female: [44, 54, 2] },
    { ageGroup: "15-20", male: [99, 1, 0], female: [83, 17, 0] },
    { ageGroup: "0-15", male: [100, 0, 0], female: [100, 0, 0] },
];

const ageCategories = ["OVER 65", "55-65", "45-55", "35-45", "30-35", "25-30", "20-25", "15-20", "0-15"];
const ageLabels = {
    "OVER 65": "OVER 65",
    "55-65": "55 – 65",
    "45-55": "45 – 55",
    "35-45": "35 – 45",
    "30-35": "30 – 35",
    "25-30": "25 – 30",
    "20-25": "20 – 25",
    "15-20": "15 – 20",
    "0-15": "0 – 15",
}
const seriesKeys = ["Single", "Married", "Widowed"];
const colors = {
    Single: "#1f64aa",
    Married: "#ce1232",
    Widowed: "#2e8b57",
};

export function Visualization(props: { width: number; height: number }) {
    const { width, height } = props;
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const chartArea = {
            topY: 215,
            bottomY: 840,
            leftX: 105,
            rightX: 705,
            centerX: 405,
        };

        const fontFamily = "Georgia, serif";

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#e3d6c8");

        const textGroup = svg.append("g").attr("font-family", fontFamily).attr("fill", "black");
        
        textGroup.append("text").attr("x", width / 2).attr("y", 75).attr("text-anchor", "middle").attr("font-size", "22px").text("Conjugal condition of American Negroes according to age periods.");
        textGroup.append("text").attr("x", width / 2).attr("y", 110).attr("text-anchor", "middle").attr("font-size", "14px").text("Condition conjugale des Nègres Americains au point de vue de l' age.");
        textGroup.append("text").attr("x", width / 2).attr("y", 150).attr("text-anchor", "middle").attr("font-size", "12px").text("Done by Atlanta University.");
        textGroup.append("text").attr("x", 255).attr("y", 205).attr("text-anchor", "middle").attr("font-weight", "bold").attr("font-size", "12px").text("MALES.");
        textGroup.append("text").attr("x", 555).attr("y", 205).attr("text-anchor", "middle").attr("font-weight", "bold").attr("font-size", "12px").text("FEMALES.");

        const yScale = d3.scaleBand().domain(ageCategories).range([chartArea.topY, chartArea.bottomY]).padding(0);
        const xScaleMale = d3.scaleLinear().domain([0, 100]).range([chartArea.centerX, chartArea.leftX]);
        const xScaleFemale = d3.scaleLinear().domain([0, 100]).range([chartArea.centerX, chartArea.rightX]);

        const yAxisLabels = svg.append("g").attr("font-family", fontFamily).attr("font-size", "12px");
        ageCategories.forEach(age => {
            const y = (yScale(age) as number) + yScale.bandwidth() / 2;
            yAxisLabels.append("text").attr("x", 95).attr("y", y).attr("text-anchor", "end").attr("dominant-baseline", "middle").text(ageLabels[age as keyof typeof ageLabels]);
            yAxisLabels.append("text").attr("x", 715).attr("y", y).attr("text-anchor", "start").attr("dominant-baseline", "middle").text(ageLabels[age as keyof typeof ageLabels]);
        });
        yAxisLabels.append("text").attr("x", 80).attr("y", 195).text("AGES.").attr("text-anchor", "middle");
        yAxisLabels.append("text").attr("x", 730).attr("y", 195).text("AGES.").attr("text-anchor", "middle");

        const xAxisLabels = svg.append("g").attr("font-family", fontFamily).attr("font-size", "12px").attr("text-anchor", "middle");
        for (let i = 0; i <= 100; i += 10) {
            xAxisLabels.append("text").attr("x", xScaleMale(i)).attr("y", 860).text(i);
            if (i > 0) {
                xAxisLabels.append("text").attr("x", xScaleFemale(i)).attr("y", 860).text(i);
            }
        }
        xAxisLabels.append("text").attr("x", width/2).attr("y", 880).text("PER CENTS.");

        const grid = svg.append("g");
        for (let i = 0; i <= 100; i += 10) {
            grid.append("line").attr("x1", xScaleMale(i)).attr("x2", xScaleMale(i)).attr("y1", chartArea.topY).attr("y2", chartArea.bottomY).attr("stroke", "black").attr("stroke-width", 0.5).attr("opacity", 0.5);
            grid.append("line").attr("x1", xScaleFemale(i)).attr("x2", xScaleFemale(i)).attr("y1", chartArea.topY).attr("y2", chartArea.bottomY).attr("stroke", "black").attr("stroke-width", 0.5).attr("opacity", 0.5);
        }
        ageCategories.forEach(age => {
            const y = yScale(age) as number;
            grid.append("line").attr("x1", chartArea.leftX).attr("x2", chartArea.rightX).attr("y1", y).attr("y2", y).attr("stroke", "black").attr("stroke-width", 0.5).attr("opacity", 0.5);
        });
        grid.append("line").attr("x1", chartArea.leftX).attr("x2", chartArea.rightX).attr("y1", chartArea.bottomY).attr("y2", chartArea.bottomY).attr("stroke", "black").attr("stroke-width", 0.5).attr("opacity", 0.5);


        const maleData = data.map(d => ({ ageGroup: d.ageGroup, ...d.male.reduce((acc, v, i) => ({ ...acc, [seriesKeys[i]]: v }), {}) }));
        const femaleData = data.map(d => ({ ageGroup: d.ageGroup, ...d.female.reduce((acc, v, i) => ({ ...acc, [seriesKeys[i]]: v }), {}) }));

        const stack = d3.stack().keys(seriesKeys).order(d3.stackOrderNone).offset(d3.stackOffsetNone);
        const maleSeries = stack(maleData as any);
        const femaleSeries = stack(femaleData as any);
        
        const barGroups = svg.append("g");
        
        const renderBars = (selection: any, isMale: boolean) => {
            selection.each(function(seriesData: any) {
                d3.select(this).selectAll("g.bar-container")
                    .data(seriesData)
                    .join("g")
                    .attr("class", "bar-container")
                    .each(function(d: any) {
                        const container = d3.select(this);
                        const y = yScale(d.data.ageGroup as string) as number;
                        const barHeight = yScale.bandwidth();
                        let x, barWidth;
                        if (isMale) {
                            x = xScaleMale(d[1]);
                            barWidth = xScaleMale(d[0]) - xScaleMale(d[1]);
                        } else {
                            x = xScaleFemale(d[0]);
                            barWidth = xScaleFemale(d[1]) - xScaleFemale(d[0]);
                        }

                        container.append("rect")
                            .attr("y", y)
                            .attr("x", x)
                            .attr("width", barWidth)
                            .attr("height", barHeight)
                            .attr("stroke", "black")
                            .attr("stroke-width", 0.5);
                        
                        // Add vertical lines
                        const lineCount = barWidth / 3;
                        for(let i=1; i < lineCount; i++) {
                            container.append("line")
                                .attr("x1", x + i * 3)
                                .attr("x2", x + i * 3)
                                .attr("y1", y)
                                .attr("y2", y + barHeight)
                                .attr("stroke", "black")
                                .attr("stroke-width", 0.5)
                                .attr("opacity", 0.3);
                        }
                    });
            });
        };

        barGroups.selectAll("g.male")
            .data(maleSeries)
            .join("g")
            .attr("class", "male")
            .attr("fill", d => colors[d.key as keyof typeof colors])
            .call(renderBars, true);

        barGroups.selectAll("g.female")
            .data(femaleSeries)
            .join("g")
            .attr("class", "female")
            .attr("fill", d => colors[d.key as keyof typeof colors])
            .call(renderBars, false);

        const inChartLabels = svg.append("g").attr("font-family", fontFamily).attr("font-size", "18px").attr("font-weight", "bold").attr("fill", "black").attr("text-anchor", "middle");
        inChartLabels.append("text").attr("transform", "translate(290, 650) rotate(-55)").text("SINGLE");
        inChartLabels.append("text").attr("transform", "translate(250, 450) rotate(-55)").text("MARRIED");
        inChartLabels.append("text").attr("transform", "translate(122, 350) rotate(-55)").text("WIDOWED");
        inChartLabels.append("text").attr("transform", "translate(520, 650) rotate(55)").text("SINGLE");
        inChartLabels.append("text").attr("transform", "translate(560, 450) rotate(55)").text("MARRIED");
        inChartLabels.append("text").attr("transform", "translate(688, 350) rotate(55)").text("WIDOWED");

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