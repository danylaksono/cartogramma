/**
 * Utility functions for exporting visualizations
 */

/**
 * Export an SVG element to PNG
 * @param {SVGElement} svgNode - The SVG DOM node to export
 * @param {number} width - The width of the output image
 * @param {number} height - The height of the output image
 */
export function exportToPNG(svgNode, width, height) {
  try {
    // Validate parameters
    if (!svgNode || svgNode.tagName !== "svg") {
      throw new Error("Invalid SVG node provided.");
    }

    // Ensure valid dimensions
    const exportWidth = Math.max(
      50,
      width || svgNode.width?.baseVal?.value || 800
    );
    const exportHeight = Math.max(
      50,
      height || svgNode.height?.baseVal?.value || 600
    );

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgNode);

    // Fix SVG namespace issue if needed
    if (
      !svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
    ) {
      svgString = svgString.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }

    // Create canvas and set up image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Handle SVG to image conversion
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        // Set canvas size and draw image
        canvas.width = exportWidth;
        canvas.height = exportHeight;

        // Fill with white background to handle transparency
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, exportWidth, exportHeight);

        // Draw SVG on canvas
        ctx.drawImage(img, 0, 0, exportWidth, exportHeight);

        // Convert to PNG
        const pngUrl = canvas.toDataURL("image/png");

        // Create download link
        const link = document.createElement("a");
        const fileName = `cartogram_${new Date()
          .toISOString()
          .slice(0, 10)}.png`;
        link.download = fileName;
        link.href = pngUrl;
        link.click();

        // Clean up
        URL.revokeObjectURL(url);
        console.log(`Exported ${fileName} successfully.`);
      } catch (error) {
        console.error("Error generating PNG:", error);
        alert(`Export failed during PNG generation: ${error.message}`);
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = (error) => {
      console.error("Failed to load SVG image for export:", error);
      alert("Failed to convert SVG to image. Please try again.");
      URL.revokeObjectURL(url);
    };

    // Set image source to SVG blob URL
    img.src = url;
  } catch (error) {
    console.error("Export failed:", error);
    alert(`Export failed: ${error.message}`);
  }
}
