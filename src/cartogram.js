/**
 * Main Cartogram class
 * Handles the creation and rendering of the cartogram visualization
 */
import { d3 } from "./utils/d3-module.js";
import { preprocessChartData } from "./utils/data-processor.js";
import { createTooltip } from "./components/tooltip.js";
import { createLegend } from "./components/legend.js";
import { renderGridCells } from "./components/grid.js";
import { exportToPNG } from "./utils/export.js";

export class Cartogram {
  /**
   * Create a new Cartogram instance
   * @param {Object} options - Configuration options
   */
  constructor({
    containerSelector = ".cartogram-container",
    width = 1200,
    height = 1000,
    margin = { top: 40, right: 40, bottom: 40, left: 40 },
    gridPadding = 4,
    labelFontSize = 12,
    labelPosition = "top", // top, bottom, left, right, center
    gridFill = "#dfe4ea",
    hoverFill = "#ffd700",
    borderColor = "#333",
    borderRadius = 4,
    showLegend = true,
    legendPosition = "top-right",
    gridLabelColumn = "label",
    chartLabelColumn = "label",
    animationDuration = 500,
    preprocessOptions = {},
  }) {
    // Validate inputs
    this.container = d3.select(containerSelector);
    if (this.container.empty()) {
      throw new Error(
        `Container with selector "${containerSelector}" not found.`
      );
    }

    // Initialize properties
    this.width = width;
    this.height = height;
    this.margin = margin;
    this.gridPadding = gridPadding;
    this.labelFontSize = labelFontSize;
    this.labelPosition = labelPosition;
    this.gridFill = gridFill;
    this.hoverFill = hoverFill;
    this.borderColor = borderColor;
    this.borderRadius = borderRadius;
    this.showLegend = showLegend;
    this.legendPosition = legendPosition;
    this.gridLabelColumn = gridLabelColumn;
    this.chartLabelColumn = chartLabelColumn;
    this.animationDuration = animationDuration;
    this.preprocessOptions = preprocessOptions;

    // Data holders
    this.gridData = [];
    this.chartData = null;
    this.gridSize = 0;
    this.maxRow = 0;
    this.maxCol = 0;
    this.gridMap = new Map();
    this.selectedGrid = null;
    this.customGlyphFunction = null;
    this.customGlyphConfig = null;
    this.legendVisibility = new Map();

    // Setup SVG
    this.svg = this.container.select(".cartogram-svg");
    if (this.svg.empty()) {
      throw new Error(
        'SVG element with class "cartogram-svg" not found in container.'
      );
    }
    this.svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img")
      .attr("aria-label", "Cartogram visualization");

    // Setup tooltip
    this.tooltip = createTooltip(this.container);

    // Setup export button
    this.setupExportButton();
  }

  /**
   * Set up the export button functionality
   * @private
   */
  setupExportButton() {
    const button = this.container.select(".export-button");
    if (button.empty()) {
      console.warn("Export button not found. Skipping export setup.");
      return;
    }

    button.on("click", () => {
      exportToPNG(this.svg.node(), this.width, this.height);
    });
  }

  /**
   * Load and validate grid CSV data
   * @param {string} csvText - The CSV data as a string
   */
  async loadGridData(csvText) {
    try {
      if (!csvText || typeof csvText !== "string" || csvText.trim() === "") {
        throw new Error("Grid CSV text is empty or invalid.");
      }

      const data = await d3.csvParse(csvText);
      if (
        !data.every(
          (d) => this.gridLabelColumn in d && "row" in d && "col" in d
        )
      ) {
        throw new Error(
          `Grid CSV must contain "${this.gridLabelColumn}", "row", and "col" columns.`
        );
      }

      this.gridData = data.map((d) => ({
        label: d[this.gridLabelColumn] || "",
        row: parseInt(d.row),
        col: parseInt(d.col),
      }));

      // Validate rows and cols
      this.gridData.forEach((d) => {
        if (isNaN(d.row) || isNaN(d.col) || d.row < 1 || d.col < 1) {
          throw new Error(`Invalid row or col for label "${d.label}".`);
        }
        const key = `${d.row}-${d.col}`;
        if (this.gridMap.has(key)) {
          throw new Error(
            `Duplicate grid position at row ${d.row}, col ${d.col}.`
          );
        }
        this.gridMap.set(key, d);
      });

      this.maxRow = Math.max(...this.gridData.map((d) => d.row), 1);
      this.maxCol = Math.max(...this.gridData.map((d) => d.col), 1);

      // Calculate grid size
      const plotWidth = this.width - this.margin.left - this.margin.right;
      const plotHeight = this.height - this.margin.top - this.margin.bottom;
      this.gridSize =
        Math.min(plotWidth / this.maxCol, plotHeight / this.maxRow) -
        this.gridPadding;

      if (this.gridSize <= 0) {
        throw new Error(
          "Grid size is too small. Increase canvas size or reduce number of rows/columns."
        );
      }

      console.log(
        "Grid data loaded successfully:",
        this.gridData.length,
        "entries"
      );
    } catch (error) {
      console.error("Failed to load grid data:", error);
      this.displayError(error.message);
      throw error;
    }
  }

  /**
   * Load and preprocess chart data CSV
   * @param {string} csvText - The CSV data as a string
   */
  async loadChartData(csvText) {
    try {
      if (!csvText || typeof csvText !== "string" || csvText.trim() === "") {
        console.warn(
          "Chart CSV text is empty or invalid. Skipping chart data."
        );
        this.chartData = null;
        return;
      }

      const data = await d3.csvParse(csvText);
      if (!data.every((d) => this.chartLabelColumn in d)) {
        throw new Error(
          `Chart CSV must contain "${this.chartLabelColumn}" column.`
        );
      }

      // Apply preprocessing
      const processedData = preprocessChartData(data, this.preprocessOptions);
      this.chartData = new Map(
        processedData.map((d) => [d[this.chartLabelColumn], d])
      );
      console.log(
        "Chart data loaded successfully:",
        processedData.length,
        "entries"
      );
    } catch (error) {
      console.error("Failed to load chart data:", error);
      this.chartData = null;
    }
  }

  /**
   * Display error message on SVG
   * @param {string} message - The error message to display
   * @private
   */
  displayError(message) {
    this.svg.selectAll("*").remove();
    this.svg
      .append("text")
      .attr("class", "error-message")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2)
      .text(message);
  }

  /**
   * Show tooltip
   * @param {Event} event - The mouse event
   * @param {Object} d - The data object
   * @private
   */
  showTooltip(event, d) {
    if (!event || !d || !this.tooltip) {
      return;
    }

    // Make sure label is available
    const label = d.label || "Unknown";
    let tooltipContent = label;

    // Add data from chart if available
    if (this.chartData && this.chartData.get(label)) {
      const data = this.chartData.get(label);
      try {
        Object.entries(data).forEach(([key, value]) => {
          if (key !== this.chartLabelColumn) {
            tooltipContent += `<br>${key}: ${
              typeof value === "number" ? d3.format(",")(value) : value || "N/A"
            }`;
          }
        });
      } catch (error) {
        console.error("Error generating tooltip content:", error);
      }
    }

    // Safely set tooltip position and content
    try {
      this.tooltip
        .html(tooltipContent)
        .style("display", "block")
        .style("left", `${(event.pageX || 0) + 10}px`)
        .style("top", `${(event.pageY || 0) + 10}px`);
    } catch (error) {
      console.error("Error showing tooltip:", error);
      this.tooltip.style("display", "none");
    }
  }

  /**
   * Set custom glyph function
   * @param {Function} fn - The custom glyph function
   * @param {Object} config - Configuration for the glyph function
   */
  setCustomGlyphFunction(fn, config = {}) {
    if (typeof fn !== "function") {
      console.warn("Custom glyph function must be a function. Ignoring.");
      return;
    }

    this.customGlyphFunction = fn;
    this.customGlyphConfig = config;

    if (config.legendItems) {
      config.legendItems.forEach((item) => {
        if (!this.legendVisibility.has(item.label)) {
          this.legendVisibility.set(item.label, true);
        }
      });
    }

    console.log("Custom glyph function set:", fn.name || "anonymous");
  }

  /**
   * Draw the cartogram
   */
  draw() {
    if (!this.gridData.length) {
      this.displayError("No grid data to draw");
      return;
    }

    // Clear previous content
    this.svg.selectAll("*").remove();

    // Draw grid cells
    const gridGroups = renderGridCells(
      this.svg,
      this.gridData,
      {
        margin: this.margin,
        gridSize: this.gridSize,
        gridPadding: this.gridPadding,
        borderRadius: this.borderRadius,
        labelFontSize: this.labelFontSize,
        labelPosition: this.labelPosition,
        gridFill: this.gridFill,
        hoverFill: this.hoverFill,
        borderColor: this.borderColor,
        selectedGrid: this.selectedGrid,
      },
      (event, d) => {
        // Hover handler
        d3.select(event.currentTarget)
          .select(".grid-cell")
          .attr("fill", this.hoverFill);
        this.showTooltip(event, d);
      },
      (event) => {
        // Mouse out handler
        const d = d3.select(event.currentTarget).datum();
        const isSelected = this.selectedGrid === `${d.row}-${d.col}`;
        d3.select(event.currentTarget)
          .select(".grid-cell")
          .attr("fill", isSelected ? this.hoverFill : this.gridFill);
        this.tooltip.style("display", "none");
      },
      (event, d) => {
        // Click handler
        this.selectedGrid = `${d.row}-${d.col}`;
        this.draw();
      }
    );

    // Draw custom glyphs
    if (this.customGlyphFunction && this.chartData) {
      gridGroups.each((d, i, nodes) => {
        const chartDatum = this.chartData.get(d.label);
        if (chartDatum) {
          const selection = d3
            .select(nodes[i])
            .append("g")
            .attr("class", "glyph-group");
          try {
            // Pass bounds as a separate parameter to ensure it's always defined
            const bounds = {
              x: 0,
              y: 0,
              width: this.gridSize,
              height: this.gridSize,
            };

            // Call the glyph function with proper error handling
            this.customGlyphFunction(selection, bounds, chartDatum, {
              ...this.customGlyphConfig,
              legendVisibility: this.legendVisibility,
              animationDuration: this.animationDuration,
            });
          } catch (error) {
            console.error(`Error rendering glyph for "${d.label}":`, error);
            // Add a visual indication that rendering failed
            selection
              .append("text")
              .attr("x", this.gridSize / 2)
              .attr("y", this.gridSize / 2)
              .attr("text-anchor", "middle")
              .attr("fill", "red")
              .text("⚠️");
          }
        }
      });
    }

    // Draw legend
    if (
      this.showLegend &&
      this.customGlyphFunction &&
      this.customGlyphConfig &&
      this.customGlyphConfig.legendItems
    ) {
      createLegend(
        this.svg,
        this.customGlyphConfig.legendItems,
        {
          position: this.legendPosition,
          width: this.width,
          height: this.height,
          margin: this.margin,
          visibility: this.legendVisibility,
        },
        (event, d) => {
          // Toggle legend visibility
          const isVisible = this.legendVisibility.get(d.label) !== false;
          this.legendVisibility.set(d.label, !isVisible);
          d3.select(event.currentTarget)
            .select("rect")
            .classed("disabled", isVisible);
          this.draw();
        }
      );
    }

    console.log("Cartogram drawn successfully");
  }
}
