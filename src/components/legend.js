/**
 * Legend component for the cartogram
 */
import { d3 } from "../utils/d3-module.js";

/**
 * Create a legend component
 * @param {d3.Selection} svg - The SVG element to append the legend to
 * @param {Array} items - Array of legend items
 * @param {Object} options - Configuration options
 * @param {Function} clickHandler - Click handler for legend items
 * @returns {d3.Selection} - The legend group
 */
export function createLegend(svg, items, options, clickHandler) {
  // Validate inputs
  if (!svg || svg.empty()) {
    console.error("Invalid SVG selection for legend");
    return d3.select(null); // Return empty selection
  }

  if (!Array.isArray(items) || items.length === 0) {
    console.warn("No legend items provided");
    return d3.select(null); // Return empty selection
  }

  // Apply default options if missing
  const {
    position = "top-right",
    width = 600,
    height = 400,
    margin = { top: 40, right: 40, bottom: 40, left: 40 },
    visibility = new Map(),
  } = options || {};

  try {
    const legendWidth = 120;
    const legendHeight = Math.max(items.length * 25 + 10, 35); // Ensure minimum height
    let legendX, legendY;

    // Position the legend based on the specified position
    switch (position) {
      case "top-left":
        legendX = margin.left;
        legendY = margin.top;
        break;
      case "top-right":
        legendX = Math.max(0, width - margin.right - legendWidth);
        legendY = margin.top;
        break;
      case "bottom-left":
        legendX = margin.left;
        legendY = Math.max(0, height - margin.bottom - legendHeight);
        break;
      case "bottom-right":
        legendX = Math.max(0, width - margin.right - legendWidth);
        legendY = Math.max(0, height - margin.bottom - legendHeight);
        break;
      default:
        // Default to top-right
        legendX = Math.max(0, width - margin.right - legendWidth);
        legendY = margin.top;
    }

    // Create the legend group
    const legend = svg
      .append("g")
      .attr("class", "legend-group")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    // Add a background rectangle
    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "rgba(255, 255, 255, 0.8)")
      .attr("rx", 4)
      .attr("ry", 4);

    // Add legend entries
    const legendEntries = legend
      .selectAll(".legend-entry")
      .data(items)
      .enter()
      .append("g")
      .attr("class", "legend-entry")
      .attr("transform", (d, i) => `translate(10, ${10 + i * 25})`)
      .attr("tabindex", 0)
      .attr("aria-label", (d) => `Toggle ${d.label || "item"}`)
      .on("click", function (event, d) {
        if (typeof clickHandler === "function") {
          clickHandler(event, d);
        }
      })
      .on("keypress", (event, d) => {
        if (
          (event.key === "Enter" || event.key === " ") &&
          typeof clickHandler === "function"
        ) {
          clickHandler(event, d);
        }
      });

    // Add colored rectangles for each entry
    legendEntries
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", (d) => d.color || "#ccc")
      .classed("disabled", (d) => visibility.get(d.label) === false);

    // Add text labels
    legendEntries
      .append("text")
      .attr("x", 25)
      .attr("y", 12)
      .text((d) => d.label || "Unnamed")
      .attr("font-size", 12);

    return legend;
  } catch (error) {
    console.error("Error creating legend:", error);
    return d3.select(null); // Return empty selection on error
  }
}
