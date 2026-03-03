/**
 * Format number in Indian numbering system (lakhs and crores)
 * @param {number} num - The number to format
 * @param {boolean} showDecimal - Whether to show decimal places
 * @returns {string} Formatted string like "₹54,13,879" or "₹1.2 Cr"
 */
export const formatIndianCurrency = (num, showDecimal = false) => {
  if (num === null || num === undefined || isNaN(num)) return '₹0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  // For very large numbers, use Cr/L notation
  if (absNum >= 10000000) {
    // Crores (1 Cr = 10,000,000)
    const crores = absNum / 10000000;
    return `${sign}₹${crores.toFixed(2)} Cr`;
  } else if (absNum >= 100000) {
    // Lakhs (1 L = 100,000)
    const lakhs = absNum / 100000;
    return `${sign}₹${lakhs.toFixed(2)} L`;
  }
  
  // For smaller numbers, use full Indian format
  return `${sign}₹${formatIndianNumber(Math.round(absNum))}`;
};

/**
 * Format number with Indian comma separators (XX,XX,XXX)
 * @param {number} num - The number to format
 * @returns {string} Formatted string like "54,13,879"
 */
export const formatIndianNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const numStr = Math.round(Math.abs(num)).toString();
  const sign = num < 0 ? '-' : '';
  
  if (numStr.length <= 3) {
    return sign + numStr;
  }
  
  // Last 3 digits
  let result = numStr.slice(-3);
  let remaining = numStr.slice(0, -3);
  
  // Add commas every 2 digits for the remaining part
  while (remaining.length > 0) {
    const chunk = remaining.slice(-2);
    remaining = remaining.slice(0, -2);
    result = chunk + ',' + result;
  }
  
  // Remove leading comma if present
  if (result.startsWith(',')) {
    result = result.slice(1);
  }
  
  return sign + result;
};

/**
 * Format for chart axis (abbreviated)
 * @param {number} value - The value to format
 * @returns {string} Formatted string like "₹54L" or "₹1.2Cr"
 */
export const formatChartAxis = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 10000000) {
    // Crores
    return `${sign}₹${(absValue / 10000000).toFixed(1)}Cr`;
  } else if (absValue >= 100000) {
    // Lakhs
    return `${sign}₹${(absValue / 100000).toFixed(0)}L`;
  } else if (absValue >= 1000) {
    // Thousands
    return `${sign}₹${(absValue / 1000).toFixed(0)}K`;
  }
  
  return `${sign}₹${Math.round(absValue)}`;
};

/**
 * Format percentage
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string like "8.5%"
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};
