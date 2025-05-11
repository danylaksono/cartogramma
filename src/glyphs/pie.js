/**
 * Pie chart glyph for the cartogram
 */
import { d3 } from "../utils/d3-module.js";

/**
 * Draw a pie chart in a grid cell
 * @param {d3.Selection} selection - The selection to append the chart to
 * @param {Object} bounds - The bounds of the chart area
 * @param {Object} data - The data to visualize
 * @param {Object} config - Configuration options
 */
export function drawPieChart(selection, bounds, data, config = {}) {
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
  } = config;

  // Validate data exists
  if (!data) {
    console.warn("No data provided for pie chart");
    return;
  }

  // Extract male and female counts from data, handling both raw and normalized data
  // First check if the values are already numbers (normalized)
  let male = 0;
  let female = 0;

  if (typeof data.Male === "number") {
    // Already a number, possibly normalized values
    male = data.Male;
  } else {
    // Try to parse as integer
    male = parseInt(data.Male) || 0;
  }

  if (typeof data.Female === "number") {
    // Already a number, possibly normalized values
    female = data.Female;
  } else {
    // Try to parse as integer
    female = parseInt(data.Female) || 0;
  }

  const total = male + female;

  if (total === 0) {
    console.warn("No data for pie chart:", data);
    return;
  }

  // Set up dimensions
  const radius = Math.max(0, Math.min(width, height) / 2 - 5);

  // If radius is too small, don't render
  if (radius <= 0) {
    console.warn("Dimensions too small for pie chart");
    return;
  }

  // Create arc generator
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  // Create pie generator
  const pie = d3
    .pie()
    .sort(null) // Don't sort, preserve original order
    .value((d) => d.value);

  // Prepare data for arcs - ensure it's not empty
  const pieData = [
    { category: "Male", value: male, color: config.maleColor || "#1f77b4" },
    {
      category: "Female",
      value: female,
      color: config.femaleColor || "#ff7f0e",
    },
  ].filter((d) => {
    // Only include data points with positive values and visible in legend
    return d.value > 0 && legendVisibility.get(d.category) !== false;
  });

  // Check if we have data to render
  if (pieData.length === 0) {
    console.warn("No visible data for pie chart after filtering");
    return;
  }

  // Generate the arcs
  const arcs = pie(pieData);

  // Draw arcs
  selection
    .selectAll(".pie-arc")
    .data(arcs)
    .enter()
    .append("path")
    .attr("class", "pie-arc")
    .attr("transform", `translate(${x + width / 2}, ${y + height / 2})`)
    .attr("d", arc)
    .attr("fill", (d) => d.data.color)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .attr("opacity", 0)
    .transition()
    .duration(animationDuration)
    .attr("opacity", 1);

  // Optional: Add a center circle for aesthetics
  selection
    .append("circle")
    .attr("cx", x + width / 2)
    .attr("cy", y + height / 2)
    .attr("r", radius / 4)
    .attr("fill", "#fff")
    .attr("opacity", 0.7);
}
