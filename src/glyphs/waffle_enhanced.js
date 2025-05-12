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

    // Check if we're using a single metric column or male/female comparison
    if (metricColumn) {
      // Single metric visualization
      drawSingleMetricWaffle(selection, bounds, data, {
        x,
        y,
        width,
        height,
        metricColumn,
        gridCount,
        colorScale,
        animationDuration,
        rounded,
        showLabel,
      });
    } else {
      // Male/Female comparison visualization
      drawComparisonWaffle(selection, bounds, data, {
        x,
        y,
        width,
        height,
        maleColumn,
        femaleColumn,
        maleColor,
        femaleColor,
        gridCount,
        legendVisibility,
        animationDuration,
        rounded,
      });
    }
  } catch (error) {
    console.error(`Error rendering waffle chart: ${error.message}`);
    drawErrorIndicator(selection, x, y, width, height);
  }
}

/**
 * Draw a male/female comparison waffle chart
 */
function drawComparisonWaffle(selection, bounds, data, options) {
  const {
    x,
    y,
    width,
    height,
    maleColumn,
    femaleColumn,
    maleColor,
    femaleColor,
    gridCount,
    legendVisibility,
    animationDuration,
    rounded = true,
  } = options;

  // Extract male and female counts from data
  let male = 0;
  let female = 0;

  if (typeof data[maleColumn] === "number") {
    male = data[maleColumn];
  } else {
    male = parseInt(data[maleColumn]) || 0;
  }

  if (typeof data[femaleColumn] === "number") {
    female = data[femaleColumn];
  } else {
    female = parseInt(data[femaleColumn]) || 0;
  }

  const total = male + female;

  if (total === 0) {
    console.warn("No data for comparison waffle chart:", data);
    drawErrorIndicator(selection, x, y, width, height);
    return;
  }

  // Ensure cell size is valid
  const cellSize = Math.min(width, height) / gridCount;
  if (cellSize <= 0) {
    console.warn("Invalid cell size for waffle chart. Check dimensions.");
    drawErrorIndicator(selection, x, y, width, height);
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
    .attr("rx", rounded ? 2 : 0)
    .attr("ry", rounded ? 2 : 0)
    .attr("opacity", 0)
    .transition()
    .duration(animationDuration)
    .attr("opacity", 1);
}

/**
 * Draw a single metric waffle chart
 */
function drawSingleMetricWaffle(selection, bounds, data, options) {
  const {
    x,
    y,
    width,
    height,
    metricColumn,
    gridCount,
    colorScale,
    animationDuration,
    rounded = true,
    showLabel = false,
  } = options;

  // Extract value
  let value = 0;
  if (typeof data[metricColumn] === "number") {
    value = data[metricColumn];
  } else {
    value = parseFloat(data[metricColumn]) || 0;
  }

  if (value === 0) {
    console.warn("No data for single metric waffle chart:", data);
    drawErrorIndicator(selection, x, y, width, height);
    return;
  }

  // Ensure cell size is valid
  const cellSize = Math.min(width, height) / gridCount;
  if (cellSize <= 0) {
    console.warn("Invalid cell size for waffle chart. Check dimensions.");
    drawErrorIndicator(selection, x, y, width, height);
    return;
  }

  // Generate color for the cells
  let cellColor = "#3498db"; // Default color
  if (colorScale) {
    if (typeof colorScale === "function") {
      cellColor = colorScale(value);
    } else if (Array.isArray(colorScale) && colorScale.length > 0) {
      // Simple thresholds based on array position
      const index = Math.min(
        Math.floor((value / 100) * colorScale.length),
        colorScale.length - 1
      );
      cellColor = colorScale[index];
    }
  }

  // Generate cells data
  const cells = [];
  const totalCells = gridCount * gridCount;
  const filledCells = Math.round((value / 100) * totalCells);

  for (let row = 0; row < gridCount; row++) {
    for (let col = 0; col < gridCount; col++) {
      const index = row * gridCount + col;
      if (index < filledCells) {
        cells.push({ row, col, index });
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
    .attr("width", Math.max(0, cellSize - 1))
    .attr("height", Math.max(0, cellSize - 1))
    .attr("fill", cellColor)
    .attr("rx", rounded ? 2 : 0)
    .attr("ry", rounded ? 2 : 0)
    .attr("opacity", 0)
    .transition()
    .duration(animationDuration)
    .attr("opacity", 1);
  // Add label if enabled
  if (showLabel) {
    selection
      .append("text")
      .attr("class", "waffle-label")
      .attr("x", x + width / 2)
      .attr("y", y + height - gridCount * cellSize - 4) // Position above the grid
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "#333")
      .text(`${Math.round(value)}%`);
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
