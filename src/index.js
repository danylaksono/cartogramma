/**
 * Main entry point for the application
 * Loads the default example with waffle charts
 */
import { Cartogram } from "./cartogram.js";
import { drawWaffleChart } from "./glyphs/waffle.js";
import { loadCSV } from "./utils/data-loader.js";

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Loading data...");
    const gridData = await loadCSV("./data/indonesia-grid.csv");
    const chartData = await loadCSV("./data/indonesia-population.csv");

    console.log("Initializing cartogram...");
    const cartogram = new Cartogram({
      containerSelector: ".cartogram-container",
      // labelPosition: 'top',
      showLegend: false,
      legendPosition: "top-right",
      borderRadius: 4,
      gridLabelColumn: "Initials",
      chartLabelColumn: "Initials",
      animationDuration: 500,
      preprocessOptions: {
        // normalize: ["Male", "Female"],
        // filter: { Population: { min: 500000 } },
      },
    });

    console.log("Loading grid data...");
    await cartogram.loadGridData(gridData);

    console.log("Loading chart data...");
    await cartogram.loadChartData(chartData);

    console.log("Setting custom glyph function...");
    cartogram.setCustomGlyphFunction(drawWaffleChart, {
      gridCount: 10,
      maleColor: "#1f77b4",
      femaleColor: "#ff7f0e",
      legendItems: [
        { label: "Male", color: "#3d4b55" },
        { label: "Female", color: "#ff7f0e" },
      ],
    });

    console.log("Drawing cartogram...");
    cartogram.draw();

    console.log("Initialization complete.");
  } catch (error) {
    console.error("Initialization failed:", error);
    document.querySelector(".cartogram-container").innerHTML = `
            <div class="error-message">
                <h2>Error Initializing Cartogram</h2>
                <p>${error.message}</p>
            </div>
        `;
  }
});
