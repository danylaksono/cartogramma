# Cartogram Visualization Library

A modular JavaScript library for creating interactive cartograms with customizable glyphs.

## Features

- Create beautiful cartogram visualizations with customizable grid layouts
- Multiple visualization types:
  - Waffle charts
  - Population pyramids
  - Pie charts
  - Bar charts
  - Split-bar charts
- Interactive features:
  - Tooltips
  - Toggling legend items
  - Grid cell selection
- Export visualizations as PNG images
- Responsive design for all device sizes

## Getting Started

1. Clone the repository
2. Open any of the example HTML files in your browser:
   - `examples/dashboard.html` - A comprehensive dashboard with multiple visualizations
   - `examples/education.html` - Education statistics visualizations
   - `examples/pyramid_stats.html` - Population statistics with pyramid charts
   - `examples/waffle.html` - Waffle chart example
   - `examples/pie.html` - Pie chart example
3. Visit `http://localhost:8080` in your browser

## Examples

The library includes three example visualizations:

- **Waffle Chart**: Shows population distribution using a grid of small squares
- **Population Pyramid**: Displays male/female population comparison using horizontal bars
- **Pie Chart**: Visualizes population proportions using pie segments

## Library Structure

```
/
├── index.html (main example)
├── examples/
│   ├── waffle.html
│   ├── pyramid.html
│   ├── pie.html
├── src/
│   ├── cartogram.js (main class)
│   ├── utils/
│   │   ├── data-loader.js
│   │   ├── data-processor.js
│   │   ├── export.js
│   ├── glyphs/
│   │   ├── waffle.js
│   │   ├── pyramid.js
│   │   ├── pie.js
│   ├── components/
│   │   ├── legend.js
│   │   ├── tooltip.js
│   │   ├── grid.js
├── data/
│   ├── indonesia-grid.csv
│   ├── indonesia-population.csv
├── css/
│   ├── cartogram.css
│   ├── examples.css
```

## API Usage

```javascript
import { Cartogram } from "./src/cartogram.js";
import { drawWaffleChart } from "./src/glyphs/waffle.js";
import { loadCSV } from "./src/utils/data-loader.js";

// Create a cartogram instance
const cartogram = new Cartogram({
  containerSelector: ".cartogram-container",
  labelPosition: "top",
  showLegend: true,
  legendPosition: "top-right",
  gridLabelColumn: "Region",
  chartLabelColumn: "Region",
});

// Load data
const gridData = await loadCSV("path/to/grid.csv");
const chartData = await loadCSV("path/to/data.csv");
await cartogram.loadGridData(gridData);
await cartogram.loadChartData(chartData);

// Set visualization type
cartogram.setCustomGlyphFunction(drawWaffleChart, {
  gridCount: 10,
  maleColor: "#1f77b4",
  femaleColor: "#ff7f0e",
  legendItems: [
    { label: "Male", color: "#1f77b4" },
    { label: "Female", color: "#ff7f0e" },
  ],
});

// Draw the cartogram
cartogram.draw();
```

## Creating Custom Glyphs

You can create your own custom glyph functions to display different visualizations:

```javascript
function drawCustomGlyph(selection, bounds, data, config = {}) {
  const { x, y, width, height, legendVisibility, animationDuration } = config;

  // Your visualization code here
  selection
    .append("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "steelblue");
}

// Use your custom glyph function
cartogram.setCustomGlyphFunction(drawCustomGlyph, {
  // Your configuration options
});
```

## Recent Updates (May 2025)

We've made significant improvements to the Cartogram Visualization Library:

1. **New Visualizations**:

   - Added `bar.js` for displaying bar charts to show education statistics
   - Added `split-bar.js` for comparing gender disparities in metrics
   - Enhanced all existing glyphs with better error handling and visualization options

2. **Improved Error Handling**:

   - Added comprehensive error detection and fallback visualizations
   - All glyphs now display helpful error indicators when data is invalid
   - Robust handling of both normalized and raw data formats

3. **Enhanced Visualization Features**:

   - Better animation transitions for all chart types
   - Improved color schemes for accessibility
   - More configuration options for customization
   - Added value labels and better formatting

4. **New Examples**:
   - `education.html` - Demonstrates education statistics visualization
   - `dashboard.html` - Comprehensive dashboard with multiple visualization types
   - `pyramid_stats.html` - Enhanced population statistics
5. **Updated Data**:
   - Added `indonesia-education.csv` with literacy and higher education data
   - Enhanced `indonesia-population-updated.csv` with more realistic gender distributions

Explore the examples directory to see these improvements in action!

## License

MIT License
