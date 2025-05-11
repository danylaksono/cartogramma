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
        const y = margin.top + (row - 1) * (gridSize + gridPadding);
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

    // Draw labels with wrapping, with error handling
    gridGroups.each((d, i, nodes) => {
      try {
        const selection = d3.select(nodes[i]);
        // Use a safe grid size
        const safeGridSize = Math.max(10, gridSize);
        const maxWidth =
          labelPosition === "left" || labelPosition === "right"
            ? safeGridSize * 1.5
            : safeGridSize;

        // Ensure label is a string
        const label = d.label ? String(d.label) : "";
        const words = label.split(" ");
        let line = [];
        let lines = [];

        // Process words to create wrapped lines
        words.forEach((word) => {
          line.push(word);
          const testLine = line.join(" ");
          const testWidth = estimateTextWidth(testLine, labelFontSize || 12);

          if (testWidth > maxWidth && line.length > 1) {
            lines.push(line.slice(0, -1).join(" "));
            line = [word];
          }
        });

        if (line.length) lines.push(line.join(" ")); // Create text element
        const text = selection
          .append("text")
          .attr("class", "grid-label")
          .attr("x", safeGridSize / 2)
          .attr(
            "y",
            (() => {
              switch (labelPosition) {
                case "top":
                  return -10;
                case "bottom":
                  return safeGridSize + 20;
                case "left":
                  return -10;
                case "right":
                  return safeGridSize + 10;
                default:
                  return safeGridSize / 2; // center
              }
            })()
          )
          .attr(
            "text-anchor",
            (() => {
              switch (labelPosition) {
                case "left":
                  return "end";
                case "right":
                  return "start";
                default:
                  return "middle";
              }
            })()
          )
          .attr("font-size", labelFontSize || 12);

        // Add tspan for each line
        lines.forEach((line, i) => {
          text
            .append("tspan")
            .attr("x", safeGridSize / 2)
            .attr(
              "dy",
              i === 0 && labelPosition !== "center"
                ? 0
                : (labelFontSize || 12) * 1.2
            )
            .attr(
              "text-anchor",
              (() => {
                switch (labelPosition) {
                  case "left":
                    return "end";
                  case "right":
                    return "start";
                  default:
                    return "middle";
                }
              })()
            )
            .text(line);
        });

        // Position text properly for center labels
        if (labelPosition === "center") {
          try {
            const bbox = text.node().getBBox();
            text.attr(
              "y",
              safeGridSize / 2 - bbox.height / 2 + (labelFontSize || 12) / 2
            );
          } catch (e) {
            // Fallback if getBBox fails
            text.attr("y", safeGridSize / 2);
          }
        }
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
