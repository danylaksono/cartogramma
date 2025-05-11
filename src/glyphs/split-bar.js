/**
 * Split bar chart glyph for the cartogram
 * Used for comparing two related metrics (like male/female)
 */
import { d3 } from "../utils/d3-module.js";

/**
 * Draw a split bar chart in a grid cell
 * @param {d3.Selection} selection - The selection to append the chart to
 * @param {Object} bounds - The bounds of the chart area
 * @param {Object} data - The data to visualize
 * @param {Object} config - Configuration options
 */
export function drawSplitBarChart(selection, bounds, data, config = {}) {
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
    leftMetric = "MaleLiteracy",
    rightMetric = "FemaleLiteracy",
    leftColor = "#3366cc",
    rightColor = "#dc3545",
    leftLabel = "Male",
    rightLabel = "Female",
    maxValue = 100,
    showLabels = true,
    barHeight = 20,
  } = config;

  // Validate data exists
  if (!data) {
    console.warn("No data provided for split bar chart");
    return;
  }

  // Check if metrics should be visible based on legend
  const showLeft = legendVisibility.get(leftLabel) !== false;
  const showRight = legendVisibility.get(rightLabel) !== false;

  if (!showLeft && !showRight) {
    return; // Nothing to display
  }

  // Get data values with validation
  let leftValue = 0;
  if (showLeft && leftMetric in data) {
    leftValue =
      typeof data[leftMetric] === "number"
        ? data[leftMetric]
        : parseFloat(data[leftMetric]) || 0;
  }

  let rightValue = 0;
  if (showRight && rightMetric in data) {
    rightValue =
      typeof data[rightMetric] === "number"
        ? data[rightMetric]
        : parseFloat(data[rightMetric]) || 0;
  }

  // Calculate bar dimensions
  const centerY = y + height / 2;
  const barY = centerY - barHeight / 2;
  const middleX = x + width / 2;

  // Calculate widths based on max value
  const leftWidth = showLeft ? (leftValue / maxValue) * (width / 2) : 0;
  const rightWidth = showRight ? (rightValue / maxValue) * (width / 2) : 0;

  // Draw left bar if visible
  if (showLeft && leftWidth > 0) {
    selection
      .append("rect")
      .attr("class", "split-bar-left")
      .attr("x", middleX - leftWidth)
      .attr("y", barY)
      .attr("width", 0) // Start with 0 width for animation
      .attr("height", barHeight)
      .attr("fill", leftColor)
      .attr("rx", 2)
      .attr("ry", 2)
      .transition()
      .duration(animationDuration)
      .attr("width", leftWidth);

    // Add value label for left bar if enabled
    if (showLabels) {
      selection
        .append("text")
        .attr("class", "split-bar-label")
        .attr("x", middleX - leftWidth / 2)
        .attr("y", barY - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", 8)
        .attr("opacity", 0)
        .text(`${leftValue.toFixed(1)}%`)
        .transition()
        .duration(animationDuration)
        .attr("opacity", 1);
    }
  }

  // Draw right bar if visible
  if (showRight && rightWidth > 0) {
    selection
      .append("rect")
      .attr("class", "split-bar-right")
      .attr("x", middleX)
      .attr("y", barY)
      .attr("width", 0) // Start with 0 width for animation
      .attr("height", barHeight)
      .attr("fill", rightColor)
      .attr("rx", 2)
      .attr("ry", 2)
      .transition()
      .duration(animationDuration)
      .attr("width", rightWidth);

    // Add value label for right bar if enabled
    if (showLabels) {
      selection
        .append("text")
        .attr("class", "split-bar-label")
        .attr("x", middleX + rightWidth / 2)
        .attr("y", barY - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", 8)
        .attr("opacity", 0)
        .text(`${rightValue.toFixed(1)}%`)
        .transition()
        .duration(animationDuration)
        .attr("opacity", 1);
    }
  }

  // Add center divider line
  selection
    .append("line")
    .attr("x1", middleX)
    .attr("y1", barY)
    .attr("x2", middleX)
    .attr("y2", barY + barHeight)
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2,2");
}
