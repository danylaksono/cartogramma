/**
 * Population pyramid glyph for the cartogram
 */
import { d3 } from "../utils/d3-module.js";

/**
 * Draw a population pyramid in a grid cell
 * @param {d3.Selection} selection - The selection to append the chart to
 * @param {Object} bounds - The bounds of the chart area
 * @param {Object} data - The data to visualize
 * @param {Object} config - Configuration options
 */
export function drawPopulationPyramid(selection, bounds, data, config = {}) {
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
      maleColor = "#3366cc",
      femaleColor = "#dc3545",
      showLabels = true,
      maleColumn = "Male",
      femaleColumn = "Female",
      maxValueScale = 1.1, // Scale factor for max value to add padding
    } = config;

    // Validate data exists
    if (!data) {
      console.warn("No data provided for population pyramid");
      drawErrorIndicator(selection, x, y, width, height);
      return;
    }

    // Extract male and female counts from data, handling both raw and normalized data
    // First check if the values are already numbers (normalized)
    let male = 0;
    let female = 0;

    if (typeof data[maleColumn] === "number") {
      // Already a number, possibly normalized values
      male = data[maleColumn];
    } else {
      // Try to parse as integer
      male = parseInt(data[maleColumn]) || 0;
    }

    if (typeof data[femaleColumn] === "number") {
      // Already a number, possibly normalized values
      female = data[femaleColumn];
    } else {
      // Try to parse as integer
      female = parseInt(data[femaleColumn]) || 0;
    }

    // Ensure we have valid data to display
    if (male === 0 && female === 0) {
      console.warn("No valid male or female data for population pyramid");
      drawErrorIndicator(selection, x, y, width, height);
      return;
    }

    const maxValue = Math.max(male, female, 1) * maxValueScale; // Add some padding with scale factor

    // Calculate bar dimensions with validation
    // Ensure minimum height is positive
    const barHeight = Math.max(1, height / 2 - 10);

    // Validate width and prevent negative bar widths
    if (width <= 0) {
      console.warn("Invalid width for population pyramid");
      drawErrorIndicator(selection, x, y, width, height);
      return;
    }

    const maleWidth = (male / maxValue) * (width / 2 - 5);
    const femaleWidth = (female / maxValue) * (width / 2 - 5);

    // Prepare data for bars
    const bars = [
      {
        category: "Male",
        value: maleWidth,
        rawValue: male,
        color: maleColor,
      },
      {
        category: "Female",
        value: femaleWidth,
        rawValue: female,
        color: femaleColor,
      },
    ].filter((d) => {
      // Only include data points with positive values and visible in legend
      return d.value > 0 && legendVisibility.get(d.category) !== false;
    });

    // Check if we have data to render after filtering
    if (bars.length === 0) {
      console.warn("No visible data for population pyramid after filtering");
      drawErrorIndicator(selection, x, y, width, height);
      return;
    }

    // Draw center line
    selection
      .append("line")
      .attr("x1", x + width / 2)
      .attr("y1", y)
      .attr("x2", x + width / 2)
      .attr("y2", y + height)
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    // Draw bars
    selection
      .selectAll(".pyramid-bar")
      .data(bars)
      .enter()
      .append("rect")
      .attr("class", "pyramid-bar")
      .attr("x", (d) =>
        d.category === "Male" ? x + width / 2 - d.value : x + width / 2
      )
      .attr("y", (d) => (d.category === "Male" ? y + 5 : y + barHeight + 15))
      .attr("width", 0) // Start with 0 width for animation
      .attr("height", barHeight)
      .attr("fill", (d) => d.color)
      .attr("rx", 2) // Rounded corners
      .attr("ry", 2)
      .transition()
      .duration(animationDuration)
      .attr("width", (d) => d.value);

    // Add value labels if showLabels is true
    if (showLabels) {
      selection
        .selectAll(".pyramid-value")
        .data(bars)
        .enter()
        .append("text")
        .attr("class", "pyramid-value")
        .attr("x", (d) =>
          d.category === "Male"
            ? x + width / 2 - d.value - 3
            : x + width / 2 + d.value + 3
        )
        .attr("y", (d) =>
          d.category === "Male"
            ? y + barHeight / 2 + 5
            : y + barHeight + 15 + barHeight / 2
        )
        .attr("text-anchor", (d) => (d.category === "Male" ? "end" : "start"))
        .attr("font-size", 7)
        .attr("fill", "#333")
        .attr("opacity", 0)
        .text((d) => formatNumber(d.rawValue))
        .transition()
        .duration(animationDuration)
        .attr("opacity", 0.8);

      // Add category labels
      selection
        .selectAll(".pyramid-label")
        .data(bars)
        .enter()
        .append("text")
        .attr("class", "pyramid-label")
        .attr("x", x + width / 2)
        .attr("y", (d) => (d.category === "Male" ? y + 2 : y + barHeight + 12))
        .attr("text-anchor", "middle")
        .attr("font-size", 7)
        .attr("font-weight", "bold")
        .attr("fill", (d) => d.color)
        .attr("opacity", 0)
        .text((d) => d.category)
        .transition()
        .duration(animationDuration)
        .attr("opacity", 1);
    }
  } catch (error) {
    console.error(`Error rendering population pyramid: ${error.message}`);
    drawErrorIndicator(selection, x, y, width, height);
  }
}

/**
 * Draw an error indicator when chart rendering fails
 */
function drawErrorIndicator(selection, x, y, width, height) {
  selection
    .append("rect")
    .attr("x", x + width / 4)
    .attr("y", y + height / 4)
    .attr("width", width / 2)
    .attr("height", height / 2)
    .attr("fill", "#f8d7da")
    .attr("stroke", "#f5c6cb")
    .attr("rx", 5)
    .attr("ry", 5);

  selection
    .append("text")
    .attr("x", x + width / 2)
    .attr("y", y + height / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "#721c24")
    .attr("font-size", 10)
    .text("⚠️ No Data");
}

/**
 * Format large numbers with thousands separators
 */
function formatNumber(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return Math.round(value).toString();
}
