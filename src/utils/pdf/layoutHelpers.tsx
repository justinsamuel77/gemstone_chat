// Layout helpers for custom PDF generation (now HTML-based)

// These functions are now primarily for documentation/reference
// as the actual PDF generation is handled in generator.tsx using HTML

export const PDF_CONFIG = {
  colors: {
    primary: '#1E5128',
    lightGray: '#f5f5f5',
    black: '#000000',
    white: '#ffffff'
  },
  spacing: {
    headerHeight: 60,
    sectionSpacing: 20,
    lineHeight: 8
  },
  fonts: {
    normal: 'Arial, sans-serif',
    bold: 'Arial, sans-serif'
  }
};

export const BRANDING = {
  icon: '💎',
  companyName: 'MADHAVAN JEWELLERS',
  tagline: 'Exquisite Craftsmanship Since 1990'
};

// Helper function to convert hex to RGB
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Legacy function signatures for backward compatibility
export const drawHeader = (doc: any, orderData: any): number => {
  // This is now handled in the HTML template
  return 60;
};

export const drawCustomerInfo = (doc: any, orderData: any, yPos: number): number => {
  // This is now handled in the HTML template
  return yPos + 100;
};

export const drawDealerInfo = (doc: any, orderData: any): number => {
  // This is now handled in the HTML template
  return 100;
};

export const drawSectionHeader = (doc: any, title: string, yPos: number): number => {
  // This is now handled in the HTML template
  return yPos + 15;
};

export const drawProductDetails = (doc: any, orderData: any, yPos: number): number => {
  // This is now handled in the HTML template
  return yPos + 150;
};