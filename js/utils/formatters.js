/**
 * Formatter Utilities
 * Centralized formatting functions to eliminate code duplication
 */

import { APP_CONFIG, TIME_CONSTANTS } from '../config/constants.js';

/**
 * Format balance numbers with appropriate suffixes
 * @param {number} balance - The balance to format
 * @returns {string} Formatted balance string
 */
export function formatBalance(balance) {
    if (typeof balance !== 'number' || isNaN(balance)) {
        return '0';
    }
    
    const { LARGE_NUMBER_THRESHOLD, MEDIUM_NUMBER_THRESHOLD, DECIMAL_PLACES } = APP_CONFIG.FORMATTING;
    
    if (balance >= LARGE_NUMBER_THRESHOLD) {
        return (balance / LARGE_NUMBER_THRESHOLD).toFixed(DECIMAL_PLACES) + 'M';
    } else if (balance >= MEDIUM_NUMBER_THRESHOLD) {
        return (balance / MEDIUM_NUMBER_THRESHOLD).toFixed(DECIMAL_PLACES) + 'K';
    }
    
    return balance.toString();
}

/**
 * Format time difference in a human-readable format
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date (defaults to now)
 * @returns {string} Formatted time difference
 */
export function formatTimeDifference(startDate, endDate = new Date()) {
    const diff = Math.abs(endDate - startDate);
    const seconds = Math.floor(diff / TIME_CONSTANTS.MILLISECONDS_PER_SECOND);
    const minutes = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_MINUTE);
    const hours = Math.floor(minutes / TIME_CONSTANTS.MINUTES_PER_HOUR);
    const days = Math.floor(hours / TIME_CONSTANTS.HOURS_PER_DAY);
    
    if (days > 0) {
        return `${days}d ${hours % TIME_CONSTANTS.HOURS_PER_DAY}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % TIME_CONSTANTS.MINUTES_PER_HOUR}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % TIME_CONSTANTS.SECONDS_PER_MINUTE}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Format countdown time (MM:SS format)
 * @param {number} minutes - Minutes
 * @param {number} seconds - Seconds
 * @returns {string} Formatted countdown string
 */
export function formatCountdown(minutes, seconds) {
    const padZero = (num) => num.toString().padStart(2, '0');
    return `${padZero(minutes)}:${padZero(seconds)}`;
}

/**
 * Format address for display (truncated)
 * @param {string} address - Full address
 * @param {number} prefixLength - Length of prefix (default: 8)
 * @param {number} suffixLength - Length of suffix (default: 8)
 * @returns {string} Formatted address
 */
export function formatAddress(address, prefixLength = 8, suffixLength = 8) {
    if (!address || typeof address !== 'string') {
        return 'Unknown';
    }
    
    if (address.length <= prefixLength + suffixLength + 3) {
        return address;
    }
    
    return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Format timestamp to local string
 * @param {number|Date} timestamp - Timestamp or Date object
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(timestamp) {
    if (!timestamp) {
        return '--';
    }
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString();
}

/**
 * Format file size in bytes
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format percentage
 * @param {number} value - Value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, total, decimals = 2) {
    if (total === 0) return '0%';
    
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format currency amount
 * @param {number} amount - Amount
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale (default: 'en-US')
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format number with thousands separator
 * @param {number} number - Number to format
 * @param {string} locale - Locale (default: 'en-US')
 * @returns {string} Formatted number
 */
export function formatNumber(number, locale = 'en-US') {
    return new Intl.NumberFormat(locale).format(number);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|number} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const targetDate = date instanceof Date ? date : new Date(date);
    const diff = now - targetDate;
    
    const seconds = Math.floor(diff / TIME_CONSTANTS.MILLISECONDS_PER_SECOND);
    const minutes = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_MINUTE);
    const hours = Math.floor(minutes / TIME_CONSTANTS.MINUTES_PER_HOUR);
    const days = Math.floor(hours / TIME_CONSTANTS.HOURS_PER_DAY);
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
}

// Export all formatters
export default {
    formatBalance,
    formatTimeDifference,
    formatCountdown,
    formatAddress,
    formatTimestamp,
    formatFileSize,
    formatPercentage,
    formatCurrency,
    formatNumber,
    formatRelativeTime
}; 