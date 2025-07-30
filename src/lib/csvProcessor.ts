export interface AfternicDomain {
  domain: string;
  buyNowPrice: number | null;
  floorPrice: number;
  minOffer: number | null;
  leaseToOwn: 'Y' | 'N' | null;
  maxLeasePeriod: number | null;
  saleLander: string;
  showBuyNowOption: 'Y' | 'N' | null;
  showLeaseToOwnOption: 'Y' | 'N' | null;
  showMakeOfferOption: 'Y' | 'N' | null;
  hidden: 'Y' | 'N' | null;
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
  
  // Domain validation (required, text)
  if (!row.domain || typeof row.domain !== 'string' || row.domain.trim() === '') {
    errors.push(`Row ${rowIndex + 1}: Domain is required`);
  }

  // Buy Now Price validation (can be blank)
  if (row.buyNowPrice && row.buyNowPrice.toString().trim() !== '') {
    const buyNowPrice = parseFloat(row.buyNowPrice);
    if (isNaN(buyNowPrice) || buyNowPrice < 0) {
      errors.push(`Row ${rowIndex + 1}: Buy Now Price must be a valid positive number or blank`);
    }
  }

  // Floor Price validation (can be 0, required if present)
  if (row.floorPrice && row.floorPrice.toString().trim() !== '') {
    const floorPrice = parseFloat(row.floorPrice);
    if (isNaN(floorPrice) || floorPrice < 0) {
      errors.push(`Row ${rowIndex + 1}: Floor Price must be a valid number (0 or greater)`);
    }
  }

  // Min Offer validation (can be blank, but if present must be positive)
  if (row.minOffer && row.minOffer.toString().trim() !== '') {
    const minOffer = parseFloat(row.minOffer);
    if (isNaN(minOffer) || minOffer < 0) {
      errors.push(`Row ${rowIndex + 1}: Min Offer must be a valid positive number or blank`);
    }
  }

  // Lease to Own validation (can be blank, Y, or N)
  if (row.leaseToOwn && row.leaseToOwn.toString().trim() !== '') {
    const leaseToOwn = row.leaseToOwn?.toString().toUpperCase();
    if (leaseToOwn !== 'Y' && leaseToOwn !== 'N') {
      errors.push(`Row ${rowIndex + 1}: Lease to Own must be Y, N, or blank`);
    }
  }

  // Max Lease Period validation (can be blank, but if present must be 2-60)
  if (row.maxLeasePeriod && row.maxLeasePeriod.toString().trim() !== '') {
    const maxLeasePeriod = parseInt(row.maxLeasePeriod);
    if (isNaN(maxLeasePeriod) || maxLeasePeriod < 2 || maxLeasePeriod > 60) {
      errors.push(`Row ${rowIndex + 1}: Max Lease Period must be a number between 2 and 60 or blank`);
    }
  }

  // Sale Lander validation (can be blank)
  // No validation needed - can be blank

  // Y/N field validations (can be blank, but if present must be Y or N)
  const ynFields = ['showBuyNowOption', 'showLeaseToOwnOption', 'showMakeOfferOption', 'hidden'];
  ynFields.forEach(field => {
    if (row[field] && row[field].toString().trim() !== '') {
      const value = row[field]?.toString().toUpperCase();
      if (value !== 'Y' && value !== 'N') {
        errors.push(`Row ${rowIndex + 1}: ${field} must be Y, N, or blank`);
      }
    }
  });

  return { isValid: errors.length === 0, errors };
}

export function normalizeCSVData(rawData: any[]): AfternicDomain[] {
  return rawData.map(row => ({
    domain: row.domain?.toString().trim() || '',
    buyNowPrice: (row.buyNowPrice && row.buyNowPrice.toString().trim() !== '') 
      ? parseFloat(row.buyNowPrice) 
      : null,
    floorPrice: parseFloat(row.floorPrice) || 0,
    minOffer: (row.minOffer && row.minOffer.toString().trim() !== '') 
      ? parseFloat(row.minOffer) 
      : null,
    leaseToOwn: (row.leaseToOwn && row.leaseToOwn.toString().trim() !== '') 
      ? (row.leaseToOwn?.toString().toUpperCase() === 'Y' ? 'Y' : 'N') as 'Y' | 'N'
      : null,
    maxLeasePeriod: (row.maxLeasePeriod && row.maxLeasePeriod.toString().trim() !== '') 
      ? Math.min(Math.max(parseInt(row.maxLeasePeriod), 2), 60)
      : null,
    saleLander: row.saleLander?.toString().trim() || '',
    showBuyNowOption: (row.showBuyNowOption && row.showBuyNowOption.toString().trim() !== '') 
      ? (row.showBuyNowOption?.toString().toUpperCase() === 'Y' ? 'Y' : 'N') as 'Y' | 'N'
      : null,
    showLeaseToOwnOption: (row.showLeaseToOwnOption && row.showLeaseToOwnOption.toString().trim() !== '') 
      ? (row.showLeaseToOwnOption?.toString().toUpperCase() === 'Y' ? 'Y' : 'N') as 'Y' | 'N'
      : null,
    showMakeOfferOption: (row.showMakeOfferOption && row.showMakeOfferOption.toString().trim() !== '') 
      ? (row.showMakeOfferOption?.toString().toUpperCase() === 'Y' ? 'Y' : 'N') as 'Y' | 'N'
      : null,
    hidden: (row.hidden && row.hidden.toString().trim() !== '') 
      ? (row.hidden?.toString().toUpperCase() === 'Y' ? 'Y' : 'N') as 'Y' | 'N'
      : null,
  }));
}

export function convertToCSV(data: AfternicDomain[]): string {
  const headers = CSV_HEADERS.join(',');
  const rows = data.map(row => [
    `"${row.domain}"`,
    row.buyNowPrice ?? '',
    row.floorPrice,
    row.minOffer ?? '',
    row.leaseToOwn ?? '',
    row.maxLeasePeriod ?? '',
    `"${row.saleLander}"`,
    row.showBuyNowOption ?? '',
    row.showLeaseToOwnOption ?? '',
    row.showMakeOfferOption ?? '',
    row.hidden ?? ''
  ].join(','));
  
  return [headers, ...rows].join('\n');
}