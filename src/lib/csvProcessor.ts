export interface AfternicDomain {
  [key: string]: any; // Allow dynamic properties
}

export interface CSVData {
  headers: string[];
  rows: AfternicDomain[];
}

export const CSV_HEADERS = [
  'Domain',
  'Buy Now Price',
  'Floor Price',
  'Min Offer',
  'Lease to Own',
  'Max Lease Period',
  'Sale Lander',
  'Show Buy Now Option',
  'Show Lease to Own Option',
  'Show Make Offer Option',
  'Hidden'
];

export function validateCSVFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
    return { isValid: false, error: 'Please upload a CSV file only.' };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be under 5MB.' };
  }

  return { isValid: true };
}

export function validateDomainRow(row: any, rowIndex: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validation - just check if row has any data
  const hasData = Object.values(row).some(value => 
    value !== null && value !== undefined && value.toString().trim() !== ''
  );
  
  if (!hasData) {
    errors.push(`Row ${rowIndex + 1}: Row appears to be empty`);
  }

  return { isValid: errors.length === 0, errors };
}

export function normalizeCSVData(rawData: any[], headers: string[]): CSVData {
  const rows = rawData.map(row => {
    const normalizedRow: AfternicDomain = {};
    
    // Map each header to its corresponding value
    headers.forEach(header => {
      const value = row[header];
      // Keep the original value, just ensure it's a string if it exists
      normalizedRow[header] = (value !== null && value !== undefined) 
        ? value.toString().trim() 
        : '';
    });
    
    return normalizedRow;
  });

  return {
    headers,
    rows
  };
}

export function convertToCSV(csvData: CSVData): string {
  const headers = csvData.headers.join(',');
  const rows = csvData.rows.map(row => 
    csvData.headers.map(header => {
      const value = row[header] || '';
      // Wrap in quotes if contains comma, newline, or quote
      return value.includes(',') || value.includes('\n') || value.includes('"') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
}