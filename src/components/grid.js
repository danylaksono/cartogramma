/**
 * Grid component for the cartogram
 */
import { d3 } from "../utils/d3-module.js";

/**
 * Estimate text width (approximation)
 * @param {string} text - The text to measure
 * @param {number} fontSize - The font size
 * @returns {number} - Estimated width
 * @private
 */
function estimateTextWidth(text, fontSize) {
  return text.length * (fontSize * 0.6);
}

/**
 * Create and render grid cells
 * @param {d3.Selection} svg - The SVG element to append the grid to
 * @param {Array} gridData - Array of grid data
 * @param {Object} options - Configuration options
 * @param {Function} hoverHandler - Mouse over handler
 * @param {Function} outHandler - Mouse out handler
 * @param {Function} clickHandler - Click handler
 * @returns {d3.Selection} - The grid groups
 */
export function renderGridCells(
  svg,
  gridData,
  options,
  hoverHandler,
  outHandler,
  clickHandler
) {
  // Validate inputs
  if (!svg || svg.empty()) {
    console.error("Invalid SVG selection for grid cells");
    return d3.select(null); // Return empty selection
  }

  if (!Array.isArray(gridData) || gridData.length === 0) {
    console.error("Invalid or empty grid data");
    return d3.select(null); // Return empty selection
  }

  // Set defaults for missing options
  const {
    margin = { top: 40, right: 40, bottom: 40, left: 40 },
    gridSize = 50,
    gridPadding = 4,
    borderRadius = 4,
    labelFontSize = 12,
    labelPosition = "top",
    gridFill = "#dfe4ea",
    hoverFill = "#ffd700",
    borderColor = "#333",
    selectedGrid = null,
  } = options || {};

  // Calculate extra vertical space for labels (top/bottom)
  let labelExtraSpace = 0;
  let effectiveLabelFontSize = labelFontSize;
  if (labelPosition === "bottom" || labelPosition === "top") {
    effectiveLabelFontSize = Math.min(10, labelFontSize || 12, gridSize * 0.25); // Make label small and fit
    labelExtraSpace = Math.ceil(effectiveLabelFontSize * 1.3); // 1.3x font size for label space
  }

  // Create grid groups with error handling
  try {
    const gridGroups = svg
      .selectAll(".grid-group")
      .data(gridData)
      .enter()
      .append("g")
      .attr("class", "grid-group")
      .attr("transform", (d) => {
        // Ensure valid row and column values
        const row = d.row && !isNaN(d.row) ? d.row : 1;
        const col = d.col && !isNaN(d.col) ? d.col : 1;
        const x = margin.left + (col - 1) * (gridSize + gridPadding);
        // Add extra vertical space between rows for top/bottom labels
        const y =
          margin.top + (row - 1) * (gridSize + gridPadding + labelExtraSpace);
        return `translate(${x}, ${y})`;
      })
      .attr("tabindex", 0)
      .attr("aria-label", (d) => `Grid cell: ${d.label || "Unnamed"}`)
      .on("mouseover", function (event, d) {
        if (typeof hoverHandler === "function") {
          hoverHandler(event, d);
        }
      })
      .on("mouseout", function (event, d) {
        if (typeof outHandler === "function") {
          outHandler(event, d);
        }
      })
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

    // Draw grid rectangles
    gridGroups
      .append("rect")
      .attr("class", "grid-cell")
      .attr("width", Math.max(0, gridSize)) // Ensure non-negative width
      .attr("height", Math.max(0, gridSize)) // Ensure non-negative height
      .attr("rx", borderRadius || 0)
      .attr("ry", borderRadius || 0)
      .attr("fill", (d) => {
        if (selectedGrid && selectedGrid === `${d.row}-${d.col}`) {
          return hoverFill;
        }
        return gridFill;
      })
      .attr("stroke", borderColor || "#333");

    // Draw labels with improved positioning, truncation, and unobtrusive font size
    gridGroups.each((d, i, nodes) => {
      try {
        const selection = d3.select(nodes[i]);
        const safeGridSize = Math.max(10, gridSize);
        let x, y, anchor, baseline;
        let maxWidth;
        switch (labelPosition) {
          case "top":
            x = safeGridSize / 2;
            y = -labelExtraSpace + Math.ceil(effectiveLabelFontSize * 0.9); // above cell
            anchor = "middle";
            baseline = "alphabetic";
            maxWidth = safeGridSize * 1.5;
            break;
          case "bottom":
            x = safeGridSize / 2;
            y = safeGridSize + Math.ceil(effectiveLabelFontSize * 1.1); // below cell
            anchor = "middle";
            baseline = "hanging";
            maxWidth = safeGridSize * 1.5;
            break;
          case "left":
            x = -6;
            y = safeGridSize / 2;
            anchor = "end";
            baseline = "middle";
            maxWidth = safeGridSize * 1.5;
            break;
          case "right":
            x = safeGridSize + 6;
            y = safeGridSize / 2;
            anchor = "start";
            baseline = "middle";
            maxWidth = safeGridSize * 1.5;
            break;
          case "center":
          default:
            x = safeGridSize / 2;
            y = safeGridSize / 2;
            anchor = "middle";
            baseline = "middle";
            maxWidth = safeGridSize * 0.9;
            break;
        }
        let label = d.label ? String(d.label) : "";
        let displayLabel = label;
        // Truncate if too long
        const estWidth = estimateTextWidth(label, effectiveLabelFontSize);
        if (estWidth > maxWidth) {
          let chars = Math.floor((maxWidth / estWidth) * label.length) - 2;
          if (chars < 4) chars = 4;
          displayLabel = label.slice(0, chars) + "…";
        }
        const text = selection
          .append("text")
          .attr("class", "grid-label")
          .attr("x", x)
          .attr("y", y)
          .attr("text-anchor", anchor)
          .attr("dominant-baseline", baseline)
          .attr("font-size", effectiveLabelFontSize)
          .text(displayLabel)
          .style("cursor", estWidth > maxWidth ? "pointer" : null)
          .on("mouseover", function () {
            if (estWidth > maxWidth) {
              d3.select(this).append("title").text(label);
            }
          });
      } catch (error) {
        console.error(`Error rendering label for grid cell: ${error.message}`);
      }
    });

    return gridGroups;
  } catch (error) {
    console.error("Error rendering grid cells:", error);
    return d3.select(null); // Return empty selection
  }
}
