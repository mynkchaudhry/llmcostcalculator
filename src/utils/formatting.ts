export const formatCurrency = (amount: number, currency = 'USD'): string => {
  if (amount < 0.001) {
    return `$${(amount * 1000).toFixed(6)}/1k`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const formatDate = (date: Date | string | number): string => {
  try {
    let validDate: Date;
    
    if (date instanceof Date) {
      validDate = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      validDate = new Date(date);
    } else {
      validDate = new Date();
    }
    
    // Check if the date is valid
    if (isNaN(validDate.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(validDate);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
};