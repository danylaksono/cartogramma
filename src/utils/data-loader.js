/**
 * Utility functions for loading data
 */
import { d3 } from './d3-module.js';

/**
 * Load a CSV file asynchronously
 * @param {string} url - URL of the CSV file to load
 * @returns {Promise<string>} - The CSV data as a string
 */
export async function loadCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load CSV from ${url}: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading CSV:', error);
        throw error;
    }
}

/**
 * Parse CSV content
 * @param {string} csvContent - CSV content as string
 * @returns {Array} - Array of objects representing CSV rows
 */
export function parseCSV(csvContent) {
    return d3.csvParse(csvContent);
}