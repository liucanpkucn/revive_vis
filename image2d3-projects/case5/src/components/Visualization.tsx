"use client";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

export function Visualization(props: { width: number; height: number }) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const SVG_WIDTH = 867;
    const SVG_HEIGHT = 1307;
    const LEFT_MARGIN = 75;
    const RIGHT_MARGIN = 75;
    const PLOT_WIDTH = SVG_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
    
    // Colors from transform-plan.md
    const BACKGROUND_COLOR = "#F9ECCB";
    const RED_BAR_COLOR = "#EFA09E";
    const GREEN_BAR_COLOR = "#BBC8BA";
    const GRID_AXIS_COLOR = "#555555";
    const TEXT_COLOR = "#222222";

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Set background color
        svg.append("rect")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT)
            .attr("fill", BACKGROUND_COLOR);

        // Global Header
        svg.append("text").attr("x", SVG_WIDTH - RIGHT_MARGIN).attr("y", 40).attr("text-anchor", "end").attr("font-family", "Times New Roman, serif").attr("font-size", "14px").attr("fill", TEXT_COLOR).text("ATLAS OF CANADA");
        svg.append("text").attr("x", SVG_WIDTH - RIGHT_MARGIN).attr("y", 60).attr("text-anchor", "end").attr("font-family", "Times New Roman, serif").attr("font-size", "14px").attr("fill", TEXT_COLOR).text("PLATE No 72");
        svg.append("text").attr("x", SVG_WIDTH / 2).attr("y", 90).attr("text-anchor", "middle").attr("font-family", "Arial, sans-serif").attr("font-weight", "bold").attr("font-size", "20px").attr("fill", TEXT_COLOR).text("CURRENCY AND BANKING");
        svg.append("text").attr("x", SVG_WIDTH / 2).attr("y", 115).attr("text-anchor", "middle").attr("font-family", "Times New Roman, serif").attr("font-size", "16px").attr("fill", TEXT_COLOR).text("Chartered Banks in Canada");

        // Helper function to create a bar chart
        const createBarChart = (
            chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
            chartTitle: string,
            unit: string,
            yDomain: string[],
            data: number[],
            barColor: string,
            xScaleDomain: [number, number],
            plotHeight: number,
            xTicks: number[],
            showXTicks?: boolean,
            yPaddingInner?: number,
            yPaddingOuter?: number,
            subtitle?: string
        ) => {
            chartGroup.append("text").attr("x", LEFT_MARGIN).attr("y", -35).attr("text-anchor", "start").attr("font-family", "Times New Roman, serif").attr("font-size", "14px").attr("font-weight", "bold").attr("fill", TEXT_COLOR).text(chartTitle);
            if (subtitle) {
                chartGroup.append("text").attr("x", LEFT_MARGIN).attr("y", -20).attr("text-anchor", "start").attr("font-family", "Times New Roman, serif").attr("font-size", "12px").attr("fill", TEXT_COLOR).text(subtitle);
            }
            chartGroup.append("text").attr("x", LEFT_MARGIN).attr("y", -5).attr("text-anchor", "start").attr("font-family", "Times New Roman, serif").attr("font-size", "12px").attr("fill", TEXT_COLOR).text(unit);

            const plotTop = 0;
            const plotBottom = plotHeight;

            const yScale = d3.scaleBand()
                .domain(yDomain)
                .range([plotTop, plotBottom])
                .paddingInner(yPaddingInner || 0.2)
                .paddingOuter(yPaddingOuter || 0.1);

            const xScale = d3.scaleLinear()
                .domain(xScaleDomain)
                .range([0, PLOT_WIDTH]);
            
            chartGroup.append("line")
                .attr("x1", LEFT_MARGIN)
                .attr("y1", plotTop)
                .attr("x2", LEFT_MARGIN + PLOT_WIDTH)
                .attr("y2", plotTop)
                .attr("stroke", GRID_AXIS_COLOR)
                .attr("stroke-width", 1);

            xTicks.forEach(tick => {
                chartGroup.append("line")
                    .attr("x1", LEFT_MARGIN + xScale(tick))
                    .attr("y1", plotTop)
                    .attr("x2", LEFT_MARGIN + xScale(tick))
                    .attr("y2", plotBottom)
                    .attr("stroke", GRID_AXIS_COLOR)
                    .attr("stroke-width", 0.5);

                if (showXTicks) {
                    chartGroup.append("text")
                        .attr("x", LEFT_MARGIN + xScale(tick))
                        .attr("y", plotTop - 8)
                        .attr("text-anchor", "middle")
                        .attr("font-family", "Times New Roman, serif")
                        .attr("font-size", "10px")
                        .attr("fill", TEXT_COLOR)
                        .text(tick);
                }
            });

            yDomain.forEach((d, i) => {
                const yPos = yScale(d)!;
                const barHeight = yScale.bandwidth();

                chartGroup.append("text")
                    .attr("x", LEFT_MARGIN - 15)
                    .attr("y", yPos + barHeight / 2)
                    .attr("text-anchor", "end")
                    .attr("dominant-baseline", "middle")
                    .attr("font-family", "Times New Roman, serif")
                    .attr("font-size", "12px")
                    .attr("fill", TEXT_COLOR)
                    .text(d);
                
                chartGroup.append("rect")
                    .attr("x", LEFT_MARGIN)
                    .attr("y", yPos)
                    .attr("width", xScale(data[i]))
                    .attr("height", barHeight)
                    .attr("fill", barColor);
            });
        };

        // Chart 1: Liabilities
        const chart1Group = svg.append("g").attr("transform", `translate(0, 160)`);
        createBarChart(chart1Group, "Liabilities", "Million dollars",
            ['1869', '1871', '1876', '1881', '1886', '1891', '1896', '1901', '1904'],
            [47, 82, 93, 127, 163, 198, 232, 423, 648],
            RED_BAR_COLOR, [0, 700], 120, d3.range(0, 701, 50), true, 0.3, 0.2
        );

        // Chart 2: Assets
        const chart2Group = svg.append("g").attr("transform", `translate(0, 350)`);
        createBarChart(chart2Group, "Assets", "Million dollars",
            ['1868', '1871', '1875', '1881', '1886', '1891', '1896', '1901', '1904'],
            [22, 128, 183, 203, 228, 298, 323, 533, 698],
            GREEN_BAR_COLOR, [0, 700], 120, d3.range(0, 701, 50), true, 0.3, 0.2
        );

        const createStackedBarChart = (
            chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
            chartTitle: string,
            unit: string,
            yDomain: string[],
            data: any[],
            keys: string[],
            colors: string[],
            xScaleDomain: [number, number],
            plotHeight: number,
            xTicks: number[],
            totals: string[],
            showXTicks?: boolean,
            yPaddingInner?: number,
            yPaddingOuter?: number,
        ) => {
            chartGroup.append("text").attr("x", LEFT_MARGIN).attr("y", -25).attr("text-anchor", "start").attr("font-family", "Times New Roman, serif").attr("font-size", "14px").attr("font-weight", "bold").attr("fill", TEXT_COLOR).text(chartTitle);
            chartGroup.append("text").attr("x", LEFT_MARGIN).attr("y", -5).attr("text-anchor", "start").attr("font-family", "Times New Roman, serif").attr("font-size", "12px").attr("fill", TEXT_COLOR).text(unit);

            const plotTop = 0;
            const plotBottom = plotHeight;

            const yScale = d3.scaleBand()
                .domain(yDomain)
                .range([plotTop, plotBottom])
                .paddingInner(yPaddingInner || 0.2)
                .paddingOuter(yPaddingOuter || 0.1);

            const xScale = d3.scaleLinear()
                .domain(xScaleDomain)
                .range([0, PLOT_WIDTH]);

            const colorScale = d3.scaleOrdinal<string>()
                .domain(keys)
                .range(colors);
            
            const stack = d3.stack().keys(keys);
            const series = stack(data);

            chartGroup.append("line")
                .attr("x1", LEFT_MARGIN)
                .attr("y1", plotTop)
                .attr("x2", LEFT_MARGIN + PLOT_WIDTH)
                .attr("y2", plotTop)
                .attr("stroke", GRID_AXIS_COLOR)
                .attr("stroke-width", 1);
            
            xTicks.forEach(tick => {
                chartGroup.append("line")
                    .attr("x1", LEFT_MARGIN + xScale(tick))
                    .attr("y1", plotTop)
                    .attr("x2", LEFT_MARGIN + xScale(tick))
                    .attr("y2", plotBottom)
                    .attr("stroke", GRID_AXIS_COLOR)
                    .attr("stroke-width", 0.5);

                if (showXTicks) {
                    chartGroup.append("text")
                        .attr("x", LEFT_MARGIN + xScale(tick))
                        .attr("y", plotTop - 8)
                        .attr("text-anchor", "middle")
                        .attr("font-family", "Times New Roman, serif")
                        .attr("font-size", "10px")
                        .attr("fill", TEXT_COLOR)
                        .text(tick);
                }
            });

            const barGroups = chartGroup.selectAll(".bar-group")
                .data(series)
                .enter().append("g")
                .attr("fill", d => colorScale(d.key));
            
            barGroups.selectAll("rect")
                .data(d => d)
                .enter().append("rect")
                .attr("x", d => LEFT_MARGIN + xScale(d[0]))
                .attr("y", (d, i) => yScale(yDomain[i])!)
                .attr("width", d => xScale(d[1]) - xScale(d[0]))
                .attr("height", yScale.bandwidth());

            yDomain.forEach((d, i) => {
                const yPos = yScale(d)!;
                const barHeight = yScale.bandwidth();

                chartGroup.append("text")
                    .attr("x", LEFT_MARGIN - 15)
                    .attr("y", yPos + barHeight / 2)
                    .attr("text-anchor", "end")
                    .attr("dominant-baseline", "middle")
                    .attr("font-family", "Times New Roman, serif")
                    .attr("font-size", "12px")
                    .attr("fill", TEXT_COLOR)
                    .text(d);
                
                chartGroup.append("text")
                    .attr("x", LEFT_MARGIN + PLOT_WIDTH + 15)
                    .attr("y", yPos + barHeight / 2)
                    .attr("text-anchor", "end")
                    .attr("dominant-baseline", "middle")
                    .attr("font-family", "Times New Roman, serif")
                    .attr("font-size", "10px")
                    .attr("fill", TEXT_COLOR)
                    .text(totals[i]);

            });
        };

        // Chart 3: Deposits
        const depositsData = [
            { year: '1869-1873', demand: 26, notice: 31.7 },
            { year: '1874-1878', demand: 32, notice: 37.355 },
            { year: '1879-1883', demand: 41, notice: 42.411 },
            { year: '1884-1888', demand: 48, notice: 55.083 },
            { year: '1889-1893', demand: 59, notice: 86.878 },
            { year: '1894-1898', demand: 70, notice: 125.687 },
            { year: '1899-1903', demand: 100, notice: 218.298 },
            { year: '1904', demand: 118, notice: 312.600 },
        ];
        const depositTotals = [
            "$ 57,700,000",
            "$ 69,355,446",
            "$ 83,411,315",
            "$ 103,083,737",
            "$ 145,878,000",
            "$ 195,687,000",
            "$ 318,298,814",
            "$ 430,600,762",
        ];
        const chart3Group = svg.append("g").attr("transform", `translate(0, 540)`);
        createStackedBarChart(
            chart3Group,
            "Deposits, average, 5 years",
            "Million dollars",
            depositsData.map(d => d.year),
            depositsData,
            ['demand', 'notice'],
            [RED_BAR_COLOR, GREEN_BAR_COLOR],
            [0, 425],
            120,
            d3.range(0, 426, 25),
            depositTotals,
            true,
            0.3,
            0.2
        );

        // Chart 3 Legend
        const legendGroup = svg.append("g").attr("transform", `translate(${LEFT_MARGIN}, 680)`);
        const legendItems = [
            { color: RED_BAR_COLOR, text: "Payable on demand" },
            { color: GREEN_BAR_COLOR, text: "Payable after notice" },
        ];

        legendItems.forEach((item, i) => {
            const legendItem = legendGroup.append("g").attr("transform", `translate(${i * 150}, 0)`);
            legendItem.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 20)
                .attr("height", 10)
                .attr("fill", item.color);
            legendItem.append("text")
                .attr("x", 25)
                .attr("y", 10)
                .attr("font-family", "Times New Roman, serif")
                .attr("font-size", "12px")
                .attr("fill", TEXT_COLOR)
                .text(item.text);
        });

        // Chart 4: Discount and Loans
        const chart4Group = svg.append("g").attr("transform", `translate(0, 750)`);
        createBarChart(chart4Group, "Discount and Loans", "Million dollars",
            ['1868', '1869-1873', '1874-1878', '1879-1883', '1884-1888', '1889-1893', '1894-1898', '1899-1903', '1904'],
            [59, 92, 141, 142, 191, 206, 226, 381, 511],
            RED_BAR_COLOR, [0, 600], 120, d3.range(0, 601, 50), true, 0.3, 0.2,
            "(exclusive of loans to Government) average, 5 years"
        );

        // Chart 5: Reserve Fund
        const chart5Group = svg.append("g").attr("transform", `translate(0, 940)`);
        createBarChart(chart5Group, "Reserve Fund", "Million dollars",
            ['1853', '1886', '1891', '1896', '1901', '1904'],
            [17.5, 17.8, 22.3, 26.5, 35.8, 52.3],
            RED_BAR_COLOR, [0, 50], 100, d3.range(0, 51, 5), true, 0.3, 0.2
        );

    }, []);

    return (
        <svg
            ref={svgRef}
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            xmlns="http://www.w3.org/2000/svg"
        />
    );
}
