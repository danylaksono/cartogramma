/**
 * Tooltip component for displaying information on hover
 */
import { d3 } from "../utils/d3-module.js";

/**
 * Create a tooltip element
 * @param {d3.Selection} container - The container to append the tooltip to
 * @returns {d3.Selection} - The tooltip element
 */
export function createTooltip(container) {
  // Validate container
  if (!container || container.empty()) {
    console.error("Invalid container for tooltip");
    return d3.select(document.createElement("div")); // Return empty div as fallback
  }

  try {
    let tooltip = container.select(".tooltip");

    if (tooltip.empty()) {
      tooltip = container
        .append("div")
        .attr("class", "tooltip")
        .style("display", "none")
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.95)")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.2)")
        .style("pointer-events", "none")
        .style("z-index", "1000");
    }

    return tooltip;
  } catch (error) {
    console.error("Error creating tooltip:", error);
    return d3.select(document.createElement("div")); // Return empty div as fallback
  }
}
