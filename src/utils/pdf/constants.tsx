export const PDF_CONFIG = {
  page: {
    width: 210, // A4 width in mm
    height: 297, // A4 height in mm
  },
  colors: {
    primary: '#1E5128',
    white: '#FFFFFF',
    gray: '#6B7280',
    lightGray: '#F3F4F6',
    red: '#DC2626',
    green: '#059669',
  },
  fonts: {
    normal: 'helvetica',
    bold: 'helvetica',
  },
  spacing: {
    margin: 20,
    sectionGap: 20,
    lineHeight: 6,
    headerHeight: 60,
  }
};

export const BRANDING = {
  companyName: 'GEMSTONE',
  tagline: 'Fine Jewelry',
  icon: '💎'
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