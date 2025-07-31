// Data transformation utilities for converting between CSV formats
import { getFormat } from './formatConfigs.js';

/**
 * Transform source data (Afternic) to target format
 * @param {Object} sourceData - { headers: [], rows: [] }
 * @param {string} targetFormatName - 'afternic' | 'spaceship' | 'sedo'
 * @returns {Object} - Transformed { headers: [], rows: [] }
 */
export function transformData(sourceData, targetFormatName) {
  const targetFormat = getFormat(targetFormatName);
  
  if (!sourceData || !sourceData.rows || sourceData.rows.length === 0) {
    return { headers: [], rows: [] };
  }

  // If target is afternic (source format), return filtered data
  if (targetFormatName === 'afternic') {
    return filterAfternicData(sourceData, targetFormat);
  }

  // Transform to target format
  const transformedHeaders = targetFormat.columns.map(col => col.displayName);
  const transformedRows = sourceData.rows.map(sourceRow => 
    transformRow(sourceRow, sourceData.headers, targetFormat)
  );

  return {
    headers: transformedHeaders,
    rows: transformedRows
  };
}

/**
 * Filter Afternic data to show only editable columns
 */
function filterAfternicData(sourceData, format) {
  const editableColumns = format.columns.map(col => col.displayName);
  
  const filteredRows = sourceData.rows.map(row => {
    const filteredRow = {};
    editableColumns.forEach(header => {
      filteredRow[header] = row[header] || '';
    });
    return filteredRow;
  });

  return {
    headers: editableColumns,
    rows: filteredRows
  };
}

/**
 * Transform a single row from source format to target format
 */
function transformRow(sourceRow, sourceHeaders, targetFormat) {
  const transformedRow = {};

  targetFormat.columns.forEach(column => {
    const { key, displayName, sourceColumn, transform } = column;
    
    // Get source value
    let sourceValue = '';
    if (sourceColumn && sourceRow[sourceColumn] !== undefined) {
      sourceValue = sourceRow[sourceColumn];
    }

    // Apply transformation if provided
    let transformedValue = sourceValue;
    if (transform && typeof transform === 'function') {
      transformedValue = transform(sourceValue);
    }

    transformedRow[displayName] = transformedValue || '';
  });

  return transformedRow;
}

/**
 * Reverse transform: Convert edited data back to source format
 * Used when user edits data in Spaceship/Sedo format and we need to update the source
 * @param {Object} editedRow - Row data in target format
 * @param {string} targetFormatName - Format the data is currently in
 * @param {Object} originalSourceRow - Original row in source format (for non-mapped fields)
 * @returns {Object} - Row data in source format
 */
export function reverseTransformRow(editedRow, targetFormatName, originalSourceRow = {}) {
  const targetFormat = getFormat(targetFormatName);
  const sourceRow = { ...originalSourceRow }; // Preserve non-mapped fields

  targetFormat.columns.forEach(column => {
    const { displayName, sourceColumn, reverseTransform } = column;
    
    // Skip columns that don't map to source (like Currency, Action Type)
    if (!sourceColumn) return;

    let editedValue = editedRow[displayName] || '';
    
    // Apply reverse transformation if provided
    if (reverseTransform && typeof reverseTransform === 'function') {
      editedValue = reverseTransform(editedValue);
    }

    sourceRow[sourceColumn] = editedValue;
  });

  return sourceRow;
}

/**
 * Get column configuration for a specific format and field
 * Used for form field generation and validation
 */
export function getColumnConfig(formatName, fieldKey) {
  const format = getFormat(formatName);
  return format.columns.find(col => col.key === fieldKey);
}

/**
 * Validate data for a specific format
 * @param {Object} data - { headers: [], rows: [] }
 * @param {string} formatName - Target format to validate against
 * @returns {Object} - { isValid: boolean, errors: [] }
 */
export function validateForFormat(data, formatName) {
  const format = getFormat(formatName);
  const errors = [];
  const requiredColumns = format.columns.filter(col => col.required);

  // Check if required columns exist
  requiredColumns.forEach(column => {
    if (!data.headers.includes(column.displayName)) {
      errors.push(`Missing required column: ${column.displayName}`);
    }
  });

  // Validate data in rows (sample first 10 rows to avoid performance issues)
  const sampleRows = data.rows.slice(0, 10);
  sampleRows.forEach((row, index) => {
    requiredColumns.forEach(column => {
      const value = row[column.displayName];
      if (!value || value.toString().trim() === '') {
        errors.push(`Row ${index + 1}: Missing required value for ${column.displayName}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get display info for format switching UI
 */
export function getFormatDisplayInfo(formatName) {
  const format = getFormat(formatName);
  return {
    name: format.name,
    displayName: format.displayName,
    columnCount: format.columns.length,
    filename: format.filename
  };
}