/**
 * Utility functions for processing data
 */

/**
 * Preprocess chart data
 * @param {Array} data - Array of data objects
 * @param {Object} options - Preprocessing options
 * @returns {Array} - Processed data
 */
export function preprocessChartData(data, options = {}) {
  // Validate input
  if (!Array.isArray(data)) {
    console.error("Data must be an array for preprocessing");
    return [];
  }

  // Handle empty data
  if (data.length === 0) {
    console.warn("Empty data array provided for preprocessing");
    return [];
  }

  // Create a deep copy to avoid mutating the original data
  let processedData = JSON.parse(JSON.stringify(data));
  const { normalize = [], filter = {}, custom = null } = options;

  try {
    // Normalize specified columns
    normalize.forEach((col) => {
      // Skip if column name is invalid
      if (typeof col !== "string" || !col.trim()) {
        console.warn("Invalid column name for normalization");
        return;
      }

      // Check if column exists in at least one data point
      if (!processedData.some((d) => col in d)) {
        console.warn(
          `Column "${col}" not found in chart data for normalization.`
        );
        return;
      }

      // Extract numerical values for normalization
      const values = processedData
        .map((d) => {
          // Handle various data formats
          if (d[col] === null || d[col] === undefined) return NaN;

          const parsed =
            typeof d[col] === "number"
              ? d[col]
              : parseFloat(String(d[col]).replace(/,/g, ""));
          return parsed;
        })
        .filter((v) => !isNaN(v));

      // Skip normalization if no valid values
      if (values.length === 0) {
        console.warn(`No valid numerical values in column "${col}"`);
        return;
      }

      // Calculate min and max for normalization
      const min = Math.min(...values);
      const max = Math.max(...values);

      // Skip if min equals max (would result in division by zero)
      if (max <= min) {
        console.warn(
          `Cannot normalize column "${col}": all values are the same`
        );
        return;
      }

      // Perform normalization
      processedData = processedData.map((d) => {
        const value =
          typeof d[col] === "number"
            ? d[col]
            : parseFloat(String(d[col]).replace(/,/g, ""));

        return {
          ...d,
          [col]: isNaN(value) ? d[col] : (value - min) / (max - min),
        };
      });
    });

    // Apply filters
    Object.entries(filter).forEach(([col, condition]) => {
      // Validate column name
      if (typeof col !== "string" || !col.trim()) {
        console.warn("Invalid column name for filtering");
        return;
      }

      // Check if column exists in data
      if (!processedData.some((d) => col in d)) {
        console.warn(`Column "${col}" not found in chart data for filtering.`);
        return;
      }

      // Apply filter based on condition type
      processedData = processedData.filter((d) => {
        // Handle missing values
        if (d[col] === null || d[col] === undefined) {
          return true; // Keep rows with missing values
        }

        // Parse numerical value
        const value =
          typeof d[col] === "number"
            ? d[col]
            : parseFloat(String(d[col]).replace(/,/g, ""));

        // Non-numeric values always pass through
        if (isNaN(value)) return true;

        // Simple threshold
        if (typeof condition === "number") return value >= condition;

        // Range conditions
        if (condition && typeof condition === "object") {
          if (condition.min !== undefined && value < condition.min)
            return false;
          if (condition.max !== undefined && value > condition.max)
            return false;
          return true;
        }

        // Default: keep the row
        return true;
      });
    });

    // Apply custom preprocessing function
    if (custom) {
      if (typeof custom !== "function") {
        console.warn("Custom preprocessor must be a function, ignoring");
      } else {
        try {
          const customResult = custom(processedData);
          if (Array.isArray(customResult)) {
            processedData = customResult;
          } else {
            console.error("Custom preprocessing function must return an array");
          }
        } catch (error) {
          console.error("Error in custom preprocessing function:", error);
        }
      }
    }

    // Add derived columns (like Total) for gender data
    processedData = processedData.map((d) => {
      try {
        // Only calculate totals if both Male and Female columns exist
        const hasMale = "Male" in d;
        const hasFemale = "Female" in d;

        if (hasMale || hasFemale) {
          const male = hasMale ? parseInt(d.Male) || 0 : 0;
          const female = hasFemale ? parseInt(d.Female) || 0 : 0;
          return {
            ...d,
            Total: male + female,
          };
        }
      } catch (error) {
        console.warn("Error calculating totals:", error);
      }
      return d; // Return original row if no gender data or error
    });

    return processedData;
  } catch (error) {
    console.error("Data preprocessing failed:", error);
    return data; // Fallback to unprocessed data
  }
}
