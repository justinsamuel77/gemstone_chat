// Payment helpers for custom PDF generation (now HTML-based)

import { PDF_CONFIG } from './layoutHelpers';

// Legacy function signatures for backward compatibility
export const drawPaymentSummary = (doc: any, orderData: any, yPos: number): number => {
  // This is now handled in the HTML template in generator.tsx
  return yPos + 100;
};

export const drawTimeline = (doc: any, orderData: any, yPos: number): number => {
  // This is now handled in the HTML template in generator.tsx
  return yPos + 80;
};

export const drawFooter = (doc: any): void => {
  // This is now handled in the HTML template in generator.tsx
  return;
};

// Helper functions that can still be useful
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${numAmount.toLocaleString('en-IN')}`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN');
};

export const calculateBalance = (total: string | number, advance: string | number): number => {
  const totalAmount = typeof total === 'string' ? parseFloat(total) : total;
  const advanceAmount = typeof advance === 'string' ? parseFloat(advance) : advance;
  return totalAmount - advanceAmount;
};