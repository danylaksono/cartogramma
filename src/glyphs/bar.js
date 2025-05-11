/**
 * Bar chart glyph for the cartogram
 */
import { d3 } from "../utils/d3-module.js";

/**
 * Draw a bar chart in a grid cell
 * @param {d3.Selection} selection - The selection to append the chart to
 * @param {Object} bounds - The bounds of the chart area
 * @param {Object} data - The data to visualize
 * @param {Object} config - Configuration options
 */
export function drawBarChart(selection, bounds, data, config = {}) {
  // Safely extract values from bounds and config with defaults
  const boundsX = bounds?.x || 0;
  const boundsY = bounds?.y || 0;
  const boundsWidth = bounds?.width || 100;
  const boundsHeight = bounds?.height || 100;

  const {
    x = boundsX,
    y = boundsY,
    width = boundsWidth,
    height = boundsHeight,
    legendVisibility = new Map(),
    animationDuration = 500,
    metrics = ["LiteracyRate", "HigherEd"],
    colors = ["#3498db", "#2ecc71"],
    titles = ["Literacy Rate", "Higher Ed"],
    maxValue = 100,
  } = config;

  // Validate data exists
  if (!data) {
    console.warn("No data provided for bar chart");
    return;
  }

  // Create filtered metrics based on what's available in the data and visibility
  const filteredMetrics = metrics.filter((metric, i) => {
    const hasData = metric in data && !isNaN(parseFloat(data[metric]));
    const isVisible = legendVisibility.get(titles[i] || metric) !== false;
    return hasData && isVisible;
  });

  // If no valid metrics, don't render
  if (filteredMetrics.length === 0) {
    console.warn("No valid metrics for bar chart:", data);
    return;
  }

  // Chart dimensions
  const barWidth = width / filteredMetrics.length - 4;
  const barMaxHeight = height - 10;

  // Create bars
  filteredMetrics.forEach((metric, i) => {
    // Get value and ensure it's valid
    let value = 0;
    if (typeof data[metric] === "number") {
      value = data[metric];
    } else {
      value = parseFloat(data[metric]) || 0;
    }

    // Calculate bar height
    const barHeight = (value / maxValue) * barMaxHeight;
    const barX = x + i * (barWidth + 4) + 2;
    const barY = y + height - barHeight;

    // Draw the bar
    selection
      .append("rect")
      .attr("class", "bar-rect")
      .attr("x", barX)
      .attr("y", barY)
      .attr("width", barWidth)
      .attr("height", 0) // Start with 0 height for animation
      .attr("fill", colors[i] || "#3498db")
      .attr("rx", 2)
      .attr("ry", 2)
      .transition()
      .duration(animationDuration)
      .attr("height", barHeight);

    // Add value label
    selection
      .append("text")
      .attr("class", "bar-value")
      .attr("x", barX + barWidth / 2)
      .attr("y", barY - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .attr("font-size", 8)
      .attr("opacity", 0)
      .text(`${value.toFixed(1)}%`)
      .transition()
      .duration(animationDuration)
      .attr("opacity", 1);
  });
}
