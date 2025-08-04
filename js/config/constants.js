/**
 * Application Constants and Configuration
 * Centralized configuration management to avoid hardcoded values
 */

export const APP_CONFIG = {
    // Application metadata
    VERSION: '1.0.0',
    NAME: 'Meme Coin Tracker',
    
    // Storage keys
    STORAGE_KEYS: {
        ADMIN_CONFIG: 'memeCoinAdminConfig',
        COUNTDOWN: 'memeCoinCountdown',
        REWARD_COUNTDOWN: 'memeCoinRewardCountdown',
        DETECTION: 'memeCoinDetection',
        TRANSACTIONS: 'memeCoinTransactions',
        BACKEND_TRANSACTIONS: 'memeCoinBackendTransactions',
        LARGE_TRANSACTIONS: 'memeCoinLargeTransactionNotifications',
        SUCCESS_ADDRESSES: 'memeCoinSuccessAddresses',
        HOLDERS_SNAPSHOTS: 'memeCoinHoldersSnapshots',
        HOLDERS_DATA: 'memeCoinHoldersData'
    },
    
    // Transaction limits
    TRANSACTION_LIMITS: {
        MAX_FRONTEND_RECORDS: 100,
        MAX_BACKEND_RECORDS: 100,
        MAX_SUCCESS_ADDRESSES: 5,
        MAX_HOLDERS_SNAPSHOTS: 20,
        MAX_LARGE_TRANSACTION_NOTIFICATIONS: 50
    },
    
    // Thresholds
    THRESHOLDS: {
        LARGE_TRANSACTION_AMOUNT: 1000000,
        COUNTDOWN_MAX_MINUTES: 10,
        COUNTDOWN_DEFAULT_MINUTES: 5,
        REWARD_COUNTDOWN_DEFAULT_MINUTES: 20
    },
    
    // Time intervals (in milliseconds)
    INTERVALS: {
        POLLING: 1000,           // 1 second
        COUNTDOWN_UPDATE: 1000,  // 1 second
        HOLDERS_REFRESH: 10000,  // 10 seconds
        STATUS_UPDATE: 5000,     // 5 seconds
        RETRY_DELAY: 1000,       // 1 second
        NOTIFICATION_DISPLAY: 3000 // 3 seconds
    },
    
    // Solana configuration
    SOLANA: {
        LP_ADDRESS: 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh',
        TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        WEB3_VERSION: '1.87.6',
        COMMITMENT: 'confirmed'
    },
    
    // UI configuration
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_Z_INDEX: 1000,
        MODAL_Z_INDEX: 1000,
        MAX_LOG_ENTRIES: 100
    },
    
    // Number formatting
    FORMATTING: {
        LARGE_NUMBER_THRESHOLD: 1000000,
        MEDIUM_NUMBER_THRESHOLD: 1000,
        DECIMAL_PLACES: 2
    }
};

// Time conversion constants
export const TIME_CONSTANTS = {
    MILLISECONDS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24
};

// Default configurations
export const DEFAULT_CONFIG = {
    countdown: {
        minutes: APP_CONFIG.THRESHOLDS.COUNTDOWN_DEFAULT_MINUTES,
        seconds: 0
    },
    rewardCountdown: {
        minutes: APP_CONFIG.THRESHOLDS.REWARD_COUNTDOWN_DEFAULT_MINUTES,
        seconds: 0
    },
    rpc: {
        url: 'https://api.mainnet-beta.solana.com'
    },
    token: {
        address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'
    },
    detection: {
        isRunning: false
    }
};

// Error messages
export const ERROR_MESSAGES = {
    CONNECTION_FAILED: 'Failed to connect to RPC',
    INVALID_TOKEN_ADDRESS: 'Invalid token address',
    TRANSACTION_FETCH_FAILED: 'Failed to fetch transaction',
    HOLDERS_FETCH_FAILED: 'Failed to fetch token holders',
    STORAGE_ERROR: 'Storage operation failed',
    NETWORK_ERROR: 'Network error occurred'
};

// Success messages
export const SUCCESS_MESSAGES = {
    CONNECTION_ESTABLISHED: 'Successfully connected to RPC',
    CONFIG_SAVED: 'Configuration saved successfully',
    TRANSACTION_DETECTED: 'Transaction detected',
    LARGE_TRANSACTION: 'Large transaction detected',
    COUNTDOWN_UPDATED: 'Countdown updated successfully'
};

// Validation rules
export const VALIDATION_RULES = {
    MIN_ADDRESS_LENGTH: 30,
    MAX_ADDRESS_LENGTH: 50,
    MIN_RPC_URL_LENGTH: 10,
    MAX_RPC_URL_LENGTH: 200
};

// Export for use in other modules
export default APP_CONFIG; 