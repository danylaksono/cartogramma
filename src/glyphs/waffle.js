/**
 * Waffle chart glyph for the cartogram
 */
import { d3 } from "../utils/d3-module.js";

/**
 * Draw a waffle chart in a grid cell
 * @param {d3.Selection} selection - The selection to append the chart to
 * @param {Object} bounds - The bounds of the chart area
 * @param {Object} data - The data to visualize
 * @param {Object} config - Configuration options
 */
export function drawWaffleChart(selection, bounds, data, config = {}) {
  try {
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
      gridCount = 10,
      maleColor = "#3366cc",
      femaleColor = "#dc3545",
      metricColumn = null, // For single metric charts
      colorScale = null, // For single metric color mapping
      maleColumn = "Male",
      femaleColumn = "Female",
      rounded = true,
      showLabel = false,
    } = config;

    // Validate data exists
    if (!data) {
      console.warn("No data provided for waffle chart");
      drawErrorIndicator(selection, x, y, width, height);
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
      console.warn("No data for waffle chart:", data);
      return;
    }

    // Ensure cell size is valid
    const cellSize = Math.min(width, height) / (gridCount || 1);
    if (cellSize <= 0) {
      console.warn("Invalid cell size for waffle chart. Check dimensions.");
      return;
    }

    const maleRatio = total > 0 ? male / total : 0;
    const maleCells = Math.round(maleRatio * gridCount * gridCount);

    // Generate cells data
    const cells = [];
    for (let row = 0; row < gridCount; row++) {
      for (let col = 0; col < gridCount; col++) {
        const index = row * gridCount + col;
        const category = index < maleCells ? "Male" : "Female";
        if (legendVisibility.get(category) !== false) {
          cells.push({ row, col, index, category });
        }
      }
    }

    // Draw cells
    selection
      .selectAll(".waffle-cell")
      .data(cells)
      .enter()
      .append("rect")
      .attr("class", "waffle-cell")
      .attr("x", (d) => x + d.col * cellSize)
      .attr("y", (d) => y + d.row * cellSize)
      .attr("width", Math.max(0, cellSize - 1)) // Ensure width is positive
      .attr("height", Math.max(0, cellSize - 1)) // Ensure height is positive
      .attr("fill", (d) => (d.category === "Male" ? maleColor : femaleColor))
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("opacity", 0)
      .transition()
      .duration(animationDuration)
      .attr("opacity", 1);
  } catch (error) {
    console.error("Error drawing waffle chart:", error);
  }
}
