/**
 * Utils Module
 * Provides common utility functions used across the application
 */

class Utils {
    // Number formatting
    static padZero(num) {
        return num.toString().padStart(2, '0');
    }

    static formatNumber(num, decimals = 2) {
        return Number(num).toFixed(decimals);
    }

    static formatLargeNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toString();
    }

    // Time formatting
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${Utils.padZero(hours)}:${Utils.padZero(minutes)}:${Utils.padZero(secs)}`;
        }
        return `${Utils.padZero(minutes)}:${Utils.padZero(secs)}`;
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString();
    }

    static getTimeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diff = now - past;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }

    // String manipulation
    static truncateString(str, maxLength = 50) {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }

    static capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Validation
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static isValidSolanaAddress(address) {
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }

    static isValidNumber(value) {
        return !isNaN(value) && isFinite(value);
    }

    // Array and Object utilities
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Utils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // DOM utilities
    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static addClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        }
    }

    static removeClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    }

    static toggleClass(element, className) {
        if (element && element.classList) {
            element.classList.toggle(className);
        }
    }

    static setStyle(element, styles) {
        if (element && element.style) {
            Object.assign(element.style, styles);
        }
    }

    // Storage utilities
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to set localStorage:', error);
            return false;
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to get localStorage:', error);
            return defaultValue;
        }
    }

    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove localStorage:', error);
            return false;
        }
    }

    static clearLocalStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }

    // File utilities
    static downloadFile(filename, content, type = 'text/plain') {
        try {
            const blob = new Blob([content], { type: type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Failed to download file:', error);
            return false;
        }
    }

    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Color utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static getContrastColor(hexColor) {
        const rgb = Utils.hexToRgb(hexColor);
        if (!rgb) return '#000000';
        
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    // Animation utilities
    static animate(element, properties, duration = 300, easing = 'ease') {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const startValues = {};
            
            // Get initial values
            for (const prop in properties) {
                startValues[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
            }
            
            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Apply easing
                const easedProgress = Utils.easeInOutQuad(progress);
                
                // Update properties
                for (const prop in properties) {
                    const startValue = startValues[prop];
                    const endValue = properties[prop];
                    const currentValue = startValue + (endValue - startValue) * easedProgress;
                    element.style[prop] = currentValue + (prop === 'opacity' ? '' : 'px');
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        });
    }

    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // Error handling
    static handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // You can add error reporting logic here
        // e.g., send to error tracking service
        
        return {
            message: error.message || 'An unknown error occurred',
            context: context,
            timestamp: new Date().toISOString()
        };
    }

    static async retry(fn, maxAttempts = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }
                await Utils.sleep(delay * attempt);
            }
        }
    }

    // Async utilities
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async waitForElement(selector, timeout = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return element;
            await Utils.sleep(100);
        }
        
        throw new Error(`Element ${selector} not found within ${timeout}ms`);
    }

    // Math utilities
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Utils.random(min, max + 1));
    }

    // Network utilities
    static async fetchWithTimeout(url, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    static async checkConnection(url = 'https://www.google.com') {
        try {
            await Utils.fetchWithTimeout(url, {}, 3000);
            return true;
        } catch {
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils };
} else {
    // Browser environment - expose to global scope
    window.Utils = Utils;
} 