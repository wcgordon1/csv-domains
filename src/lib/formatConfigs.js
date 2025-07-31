// Format configuration system for CSV data transformation
// Each format defines how to display and transform data from the source Afternic format

export const FORMATS = {
  afternic: {
    name: 'afternic',
    displayName: 'Afternic',
    isDefault: true,
    filename: 'Afternic_Import_CSV_Domains',
    columns: [
      { key: 'domain', displayName: 'Domain', sourceColumn: 'Domain', type: 'text', required: true },
      { key: 'buyNowPrice', displayName: 'Buy Now Price', sourceColumn: 'Buy Now Price', type: 'number' },
      { key: 'floorPrice', displayName: 'Floor Price', sourceColumn: 'Floor Price', type: 'number' },
      { key: 'minOffer', displayName: 'Min Offer', sourceColumn: 'Min Offer', type: 'number' },
      { key: 'leaseToOwn', displayName: 'Lease to Own', sourceColumn: 'Lease to Own', type: 'select', 
        options: ['Y', 'N'] },
      { key: 'maxLeasePeriod', displayName: 'Max Lease Period', sourceColumn: 'Max Lease Period', type: 'number',
        min: 2, max: 60 },
      { key: 'saleLander', displayName: 'Sale Lander', sourceColumn: 'Sale Lander', type: 'text' },
      { key: 'showBuyNow', displayName: 'Show Buy Now Option', sourceColumn: 'Show Buy Now Option', type: 'select',
        options: ['Y', 'N'] },
      { key: 'showLeaseToOwn', displayName: 'Show Lease to Own Option', sourceColumn: 'Show Lease to Own Option', type: 'select',
        options: ['Y', 'N'] },
      { key: 'showMakeOffer', displayName: 'Show Make Offer Option', sourceColumn: 'Show Make Offer Option', type: 'select',
        options: ['Y', 'N'] },
      { key: 'hidden', displayName: 'Hidden', sourceColumn: 'Hidden', type: 'select',
        options: ['Y', 'N'] }
    ],
    // Fields to exclude from editing (read-only)
    excludedEditFields: ['TLD', 'Date Added (UTC)', 'Fast Transfer', 'Listing Status', 'Views', 'Leads', 'Lead Count', 'Total Leads', 'Monthly Leads']
  },

  spaceship: {
    name: 'spaceship',
    displayName: 'Spaceship',
    filename: 'Spaceship_CSV_Domains',
    columns: [
      { key: 'domain', displayName: 'Domain', sourceColumn: 'Domain', type: 'text', required: true },
      { key: 'offerMinimum', displayName: 'Offer Minimum', sourceColumn: 'Min Offer', type: 'number' },
      { key: 'buyNowPrice', displayName: 'Buy Now Price', sourceColumn: 'Buy Now Price', type: 'number' },
      { key: 'forSalePage', displayName: 'For Sale Page', sourceColumn: 'Hidden', type: 'select',
        options: ['On', 'Off'], 
        transform: (value) => {
          if (value === 'Y') return 'Off'; // Y means hidden, so Off for sale page
          if (value === 'N') return 'On';  // N means not hidden, so On for sale page
          return 'Off'; // default
        },
        reverseTransform: (value) => {
          if (value === 'On') return 'N';  // On for sale page means not hidden
          if (value === 'Off') return 'Y'; // Off for sale page means hidden
          return 'Y'; // default to hidden
        }
      }
    ]
  },

  sedo: {
    name: 'sedo',
    displayName: 'Sedo',
    filename: 'Sedo_CSV_Domains',
    columns: [
      { key: 'domainName', displayName: 'Domain Name', sourceColumn: 'Domain', type: 'text', required: true },
      { key: 'sellingOption', displayName: 'Selling Option', sourceColumn: 'Sale Lander', type: 'select',
        options: ['MAKE_OFFER', 'BUY_NOW', ''], allowEmpty: true },
      { key: 'forSale', displayName: 'For Sale', sourceColumn: 'Hidden', type: 'select',
        options: ['Y', 'N'],
        transform: (value) => {
          if (value === 'Y') return 'N'; // Y means hidden, so N for sale
          if (value === 'N') return 'Y'; // N means not hidden, so Y for sale
          return 'N'; // default
        },
        reverseTransform: (value) => {
          if (value === 'Y') return 'N'; // Y for sale means not hidden
          if (value === 'N') return 'Y'; // N for sale means hidden
          return 'Y'; // default to hidden
        }
      },
      { key: 'price', displayName: 'Price', sourceColumn: 'Buy Now Price', type: 'number' },
      { key: 'minimumPrice', displayName: 'Minimum Price', sourceColumn: 'Min Offer', type: 'number' },
      { key: 'currency', displayName: 'Currency', sourceColumn: null, type: 'text' },
      { key: 'actionType', displayName: 'Action Type', sourceColumn: null, type: 'text' }
    ]
  }
};

// Helper function to get format by name
export function getFormat(formatName) {
  return FORMATS[formatName] || FORMATS.afternic;
}

// Get default format
export function getDefaultFormat() {
  return Object.values(FORMATS).find(format => format.isDefault) || FORMATS.afternic;
}

// Get all available formats
export function getAllFormats() {
  return Object.values(FORMATS);
}

// Get format names for UI
export function getFormatNames() {
  return Object.keys(FORMATS);
}