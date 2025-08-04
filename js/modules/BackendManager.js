/**
 * Backend Manager Module
 * Handles communication with backend system and configuration management
 */

class BackendManager {
    constructor() {
        this.config = null;
        this.syncInterval = null;
        this.firebaseEnabled = false;
        this.firebaseRefs = {};
        this.init();
    }

    init() {
        this.loadConfig();
        this.initFirebase();
        this.startSync();
    }

    // Configuration Management
    loadConfig() {
        try {
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            this.config = adminConfig ? JSON.parse(adminConfig) : this.getDefaultConfig();
        } catch (error) {
            console.error('Failed to load backend config:', error);
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            rpc: {
                url: '',
                connected: false,
                lastTest: null
            },
            token: {
                address: '',
                name: '',
                validated: false
            },
            countdown: {
                minutes: 5,
                seconds: 0,
                message: 'TO THE MOON!!! 🚀',
                lastUpdate: new Date().toISOString()
            },
            rewardCountdown: {
                minutes: 20,
                seconds: 0,
                lastUpdate: new Date().toISOString()
            },
            detection: {
                isRunning: false,
                startTime: null,
                lastUpdate: null
            },
            system: {
                lastUpdate: new Date().toISOString(),
                uptime: new Date().toISOString()
            },
            mainCountdownReward: {
                address: '',
                amount: 100000,
                isSet: false,
                lastUpdate: null
            }
        };
    }

    initFirebase() {
        try {
            // Check if Firebase is available
            if (typeof firebase !== 'undefined' && firebase.database) {
                this.firebaseEnabled = true;
                this.firebaseRefs = {
                    adminConfig: firebase.database().ref('adminConfig'),
                    detection: firebase.database().ref('detection'),
                    countdown: firebase.database().ref('countdown'),
                    rewardCountdown: firebase.database().ref('rewardCountdown'),
                    transactions: firebase.database().ref('transactions'),
                    backendTransactions: firebase.database().ref('backendTransactions'),
                    largeTransactionNotifications: firebase.database().ref('largeTransactionNotifications'),
                    successAddresses: firebase.database().ref('successAddresses'),
                    lastSignature: firebase.database().ref('lastSignature'),
                    tokenHolders: firebase.database().ref('tokenHolders'),
                    holdersSnapshots: firebase.database().ref('holdersSnapshots'),
                    mainCountdownSnapshots: firebase.database().ref('mainCountdownSnapshots'),
                    mainCountdownRewards: firebase.database().ref('mainCountdownRewards')
                };
                
                // Set up real-time listeners
                this.setupFirebaseListeners();
                console.log('Firebase real-time sync enabled for all data types');
            } else {
                console.log('Firebase not available, using localStorage only');
            }
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
            this.firebaseEnabled = false;
        }
    }

    setupFirebaseListeners() {
        if (!this.firebaseEnabled) return;

        // Flag to prevent infinite recursion
        this.isUpdatingFromFirebase = false;

        // Listen for admin config changes
        this.firebaseRefs.adminConfig.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && data !== this.config && !this.isUpdatingFromFirebase) {
                console.log('Admin config updated from Firebase');
                this.config = { ...this.getDefaultConfig(), ...data };
                this.saveConfigToLocalStorageOnly(); // Only save to localStorage, not Firebase
                this.onConfigChanged();
            }
        });

        // Listen for detection control changes
        this.firebaseRefs.detection.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Detection control updated from Firebase');
                localStorage.setItem('memeCoinDetection', JSON.stringify(data));
                this.onDetectionChanged(data);
            }
        });

        // Listen for countdown changes
        this.firebaseRefs.countdown.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Countdown updated from Firebase');
                localStorage.setItem('memeCoinCountdown', JSON.stringify(data));
                this.onCountdownChanged(data);
            }
        });

        // Listen for reward countdown changes
        this.firebaseRefs.rewardCountdown.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Reward countdown updated from Firebase');
                localStorage.setItem('memeCoinRewardCountdown', JSON.stringify(data));
                this.onRewardCountdownChanged(data);
            }
        });

        // Listen for backend transactions changes
        this.firebaseRefs.backendTransactions.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Backend transactions updated from Firebase');
                localStorage.setItem('memeCoinBackendTransactions', JSON.stringify(data));
                this.onBackendTransactionsChanged(data);
            }
        });

        // Listen for large transaction notifications changes
        this.firebaseRefs.largeTransactionNotifications.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Large transaction notifications updated from Firebase');
                localStorage.setItem('memeCoinLargeTransactionNotifications', JSON.stringify(data));
                this.onLargeTransactionNotificationsChanged(data);
            }
        });

        // Listen for success addresses changes
        this.firebaseRefs.successAddresses.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Success addresses updated from Firebase');
                localStorage.setItem('memeCoinSuccessAddresses', JSON.stringify(data));
                this.onSuccessAddressesChanged(data);
            }
        });

        // Listen for last signature changes
        this.firebaseRefs.lastSignature.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Last signature updated from Firebase');
                localStorage.setItem('memeCoinLastSignature', JSON.stringify(data));
                this.onLastSignatureChanged(data);
            }
        });

        // Listen for token holders changes
        this.firebaseRefs.tokenHolders.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Token holders updated from Firebase');
                localStorage.setItem('memeCoinTokenHolders', JSON.stringify(data));
                this.onTokenHoldersChanged(data);
            }
        });

        // Listen for holders snapshots changes
        this.firebaseRefs.holdersSnapshots.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Holders snapshots updated from Firebase');
                localStorage.setItem('memeCoinHoldersSnapshots', JSON.stringify(data));
                this.onHoldersSnapshotsChanged(data);
            }
        });
    }

    onConfigChanged() {
        // Trigger UI updates or other actions when config changes
        const event = new CustomEvent('adminConfigChanged', { detail: this.config });
        document.dispatchEvent(event);
    }

    onDetectionChanged(detectionData) {
        // Trigger detection control updates
        const event = new CustomEvent('detectionControlChanged', { detail: detectionData });
        document.dispatchEvent(event);
    }

    onCountdownChanged(countdownData) {
        // Trigger countdown updates
        const event = new CustomEvent('countdownChanged', { detail: countdownData });
        document.dispatchEvent(event);
    }

    onRewardCountdownChanged(countdownData) {
        // Trigger reward countdown updates
        const event = new CustomEvent('rewardCountdownChanged', { detail: countdownData });
        document.dispatchEvent(event);
    }

    onBackendTransactionsChanged(transactionsData) {
        // Trigger backend transactions updates
        const event = new CustomEvent('backendTransactionsChanged', { detail: transactionsData });
        document.dispatchEvent(event);
    }

    onLargeTransactionNotificationsChanged(notificationsData) {
        // Trigger large transaction notifications updates
        const event = new CustomEvent('largeTransactionNotificationsChanged', { detail: notificationsData });
        document.dispatchEvent(event);
    }

    onSuccessAddressesChanged(addressesData) {
        // Trigger success addresses updates
        const event = new CustomEvent('successAddressesChanged', { detail: addressesData });
        document.dispatchEvent(event);
    }

    onLastSignatureChanged(signatureData) {
        // Trigger last signature updates
        const event = new CustomEvent('lastSignatureChanged', { detail: signatureData });
        document.dispatchEvent(event);
    }

    onTokenHoldersChanged(holdersData) {
        // Trigger token holders updates
        const event = new CustomEvent('tokenHoldersChanged', { detail: holdersData });
        document.dispatchEvent(event);
    }

    onHoldersSnapshotsChanged(snapshotsData) {
        // Trigger holders snapshots updates
        const event = new CustomEvent('holdersSnapshotsChanged', { detail: snapshotsData });
        document.dispatchEvent(event);
    }

    getConfig() {
        return this.config;
    }

    saveConfig() {
        try {
            // Set flag to prevent Firebase listener from triggering
            this.isUpdatingFromFirebase = true;
            
            this.config.system.lastUpdate = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem('memeCoinAdminConfig', JSON.stringify(this.config));
            
            // Save to Firebase if available
            if (this.firebaseEnabled) {
                this.firebaseRefs.adminConfig.set(this.config);
                console.log('Config saved to Firebase');
            }
            
            // Reset flag after a short delay to allow Firebase to process
            setTimeout(() => {
                this.isUpdatingFromFirebase = false;
            }, 100);
            
            return true;
        } catch (error) {
            console.error('Failed to save backend config:', error);
            this.isUpdatingFromFirebase = false; // Reset flag on error
            return false;
        }
    }

    saveConfigToLocalStorageOnly() {
        try {
            // Save only to localStorage, not Firebase
            localStorage.setItem('memeCoinAdminConfig', JSON.stringify(this.config));
            return true;
        } catch (error) {
            console.error('Failed to save config to localStorage:', error);
            return false;
        }
    }

    // Synchronization
    startSync() {
        this.syncInterval = setInterval(() => {
            this.syncWithBackend();
        }, 5000); // Sync every 5 seconds
    }

    syncWithBackend() {
        try {
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            if (adminConfig) {
                const backendConfig = JSON.parse(adminConfig);
                
                // Update local config with backend changes
                this.updateConfigFromBackend(backendConfig);
                
                // Only save if we're not currently updating from Firebase
                if (!this.isUpdatingFromFirebase) {
                    this.saveConfig();
                }
            }
        } catch (error) {
            console.error('Failed to sync with backend:', error);
        }
    }

    updateConfigFromBackend(backendConfig) {
        // Update RPC configuration
        if (backendConfig.rpc) {
            this.config.rpc = { ...this.config.rpc, ...backendConfig.rpc };
        }

        // Update token configuration
        if (backendConfig.token) {
            this.config.token = { ...this.config.token, ...backendConfig.token };
        }

        // Update countdown configuration
        if (backendConfig.countdown) {
            this.config.countdown = { ...this.config.countdown, ...backendConfig.countdown };
        }

        // Update reward countdown configuration
        if (backendConfig.rewardCountdown) {
            this.config.rewardCountdown = { ...this.config.rewardCountdown, ...backendConfig.rewardCountdown };
        }

        // Update detection configuration
        if (backendConfig.detection) {
            this.config.detection = { ...this.config.detection, ...backendConfig.detection };
        }
    }

    // RPC Management
    updateRPCConfig(url, connected = false) {
        this.config.rpc.url = url;
        this.config.rpc.connected = connected;
        this.config.rpc.lastTest = new Date().toISOString();
        this.saveConfig();
    }

    getRPCConfig() {
        return this.config.rpc;
    }

    // Token Management
    updateTokenConfig(address, name, validated = false) {
        this.config.token.address = address;
        this.config.token.name = name;
        this.config.token.validated = validated;
        this.saveConfig();
    }

    getTokenConfig() {
        return this.config.token;
    }

    // Countdown Management
    updateCountdownConfig(minutes, seconds = 0, message = null) {
        this.config.countdown.minutes = minutes;
        this.config.countdown.seconds = seconds;
        if (message) {
            this.config.countdown.message = message;
        }
        this.config.countdown.lastUpdate = new Date().toISOString();
        this.saveConfig();
    }

    getCountdownConfig() {
        return this.config.countdown;
    }

    // Reward Countdown Management
    updateRewardCountdownConfig(minutes, seconds = 0) {
        this.config.rewardCountdown.minutes = minutes;
        this.config.rewardCountdown.seconds = seconds;
        this.config.rewardCountdown.lastUpdate = new Date().toISOString();
        this.saveConfig();
    }

    getRewardCountdownConfig() {
        return this.config.rewardCountdown;
    }

    // Detection Management
    updateDetectionConfig(isRunning, rpcUrl = null, tokenAddress = null) {
        this.config.detection.isRunning = isRunning;
        if (isRunning) {
            this.config.detection.startTime = new Date().toISOString();
        } else {
            this.config.detection.startTime = null;
        }
        this.config.detection.lastUpdate = new Date().toISOString();
        this.saveConfig();

        // Also update detection control
        if (isRunning && rpcUrl && tokenAddress) {
            this.setDetectionControl(isRunning, rpcUrl, tokenAddress);
        } else if (!isRunning) {
            this.clearDetectionControl();
        }
    }

    getDetectionConfig() {
        return this.config.detection;
    }

    // Detection Control
    setDetectionControl(isRunning, rpcUrl, tokenAddress) {
        try {
            const detectionConfig = {
                isRunning: isRunning,
                rpcUrl: rpcUrl,
                tokenAddress: tokenAddress,
                startTime: new Date().toISOString(),
                lastUpdate: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('memeCoinDetection', JSON.stringify(detectionConfig));
            
            // Save to Firebase if available
            if (this.firebaseEnabled) {
                this.firebaseRefs.detection.set(detectionConfig);
                console.log('Detection control saved to Firebase');
            }
        } catch (error) {
            console.error('Failed to set detection control:', error);
        }
    }

    clearDetectionControl() {
        try {
            localStorage.removeItem('memeCoinDetection');
            
            // Clear from Firebase if available
            if (this.firebaseEnabled) {
                this.firebaseRefs.detection.remove();
                console.log('Detection control cleared from Firebase');
            }
        } catch (error) {
            console.error('Failed to clear detection control:', error);
        }
    }

    getDetectionControl() {
        try {
            const detectionConfig = localStorage.getItem('memeCoinDetection');
            return detectionConfig ? JSON.parse(detectionConfig) : null;
        } catch (error) {
            console.error('Failed to get detection control:', error);
            return null;
        }
    }

    // Transaction Management
    getBackendTransactions() {
        try {
            const backendData = localStorage.getItem('memeCoinBackendTransactions');
            if (backendData) {
                const data = JSON.parse(backendData);
                return data.transactions || [];
            }
            return [];
        } catch (error) {
            console.error('Failed to get backend transactions:', error);
            return [];
        }
    }

    addBackendTransaction(transactionData) {
        try {
            const backendData = localStorage.getItem('memeCoinBackendTransactions');
            let data = backendData ? JSON.parse(backendData) : { transactions: [] };
            
            // Check for duplicates
            const isDuplicate = data.transactions.some(tx => tx.signature === transactionData.signature);
            if (isDuplicate) {
                return false;
            }

            data.transactions.unshift(transactionData);
            
            // Keep only the latest 100 transactions
            const maxTransactions = 100;
            if (data.transactions.length > maxTransactions) {
                data.transactions = data.transactions.slice(0, maxTransactions);
            }

            data.lastUpdate = new Date().toISOString();
            localStorage.setItem('memeCoinBackendTransactions', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to add backend transaction:', error);
            return false;
        }
    }

    clearBackendTransactions() {
        try {
            localStorage.removeItem('memeCoinBackendTransactions');
            return true;
        } catch (error) {
            console.error('Failed to clear backend transactions:', error);
            return false;
        }
    }

    // System Status
    updateSystemStatus() {
        this.config.system.lastUpdate = new Date().toISOString();
        this.saveConfig();
    }

    getSystemStatus() {
        return {
            ...this.config.system,
            uptime: this.calculateUptime()
        };
    }

    calculateUptime() {
        try {
            const startTime = new Date(this.config.system.uptime);
            const now = new Date();
            const diff = now - startTime;
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            return { days, hours, minutes, seconds };
        } catch (error) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
    }

    // Utility Methods
    validateConfig() {
        const errors = [];
        
        if (!this.config.rpc.url) {
            errors.push('RPC URL is required');
        }
        
        if (!this.config.token.address) {
            errors.push('Token address is required');
        }
        
        if (this.config.countdown.minutes < 1 || this.config.countdown.minutes > 1440) {
            errors.push('Countdown minutes must be between 1 and 1440');
        }
        
        if (this.config.rewardCountdown.minutes < 1 || this.config.rewardCountdown.minutes > 1440) {
            errors.push('Reward countdown minutes must be between 1 and 1440');
        }
        
        return errors;
    }

    exportConfig() {
        try {
            const exportData = {
                ...this.config,
                exportTime: new Date().toISOString(),
                version: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meme-coin-config-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Failed to export config:', error);
            return false;
        }
    }

    importConfig(configData) {
        try {
            const importedConfig = typeof configData === 'string' ? 
                JSON.parse(configData) : configData;
            
            // Validate imported config
            if (!importedConfig.rpc || !importedConfig.token || !importedConfig.countdown) {
                throw new Error('Invalid config format');
            }
            
            // Update local config
            this.config = { ...this.getDefaultConfig(), ...importedConfig };
            this.saveConfig();
            
            return true;
        } catch (error) {
            console.error('Failed to import config:', error);
            return false;
        }
    }

    // Cleanup
    start() {
        // Backend Manager is already started in init()
        console.log('Backend Manager started');
    }

    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Remove Firebase listeners
        if (this.firebaseEnabled) {
            Object.values(this.firebaseRefs).forEach(ref => {
                ref.off();
            });
        }
    }

    // Sync all current state to Firebase
    syncAllToFirebase() {
        if (!this.firebaseEnabled) {
            console.log('Firebase not available for sync');
            return;
        }

        try {
            // Sync admin config
            this.firebaseRefs.adminConfig.set(this.config);
            
            // Sync detection control
            const detectionControl = localStorage.getItem('memeCoinDetection');
            if (detectionControl) {
                this.firebaseRefs.detection.set(JSON.parse(detectionControl));
            }
            
            // Sync countdown
            const countdown = localStorage.getItem('memeCoinCountdown');
            if (countdown) {
                this.firebaseRefs.countdown.set(JSON.parse(countdown));
            }
            
            // Sync reward countdown
            const rewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
            if (rewardCountdown) {
                this.firebaseRefs.rewardCountdown.set(JSON.parse(rewardCountdown));
            }
            
            // Sync backend transactions
            const backendTransactions = localStorage.getItem('memeCoinBackendTransactions');
            if (backendTransactions) {
                this.firebaseRefs.backendTransactions.set(JSON.parse(backendTransactions));
            }
            
            // Sync large transaction notifications
            const largeTransactionNotifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            if (largeTransactionNotifications) {
                this.firebaseRefs.largeTransactionNotifications.set(JSON.parse(largeTransactionNotifications));
            }
            
            // Sync success addresses
            const successAddresses = localStorage.getItem('memeCoinSuccessAddresses');
            if (successAddresses) {
                this.firebaseRefs.successAddresses.set(JSON.parse(successAddresses));
            }
            
            // Sync last signature
            const lastSignature = localStorage.getItem('memeCoinLastSignature');
            if (lastSignature) {
                this.firebaseRefs.lastSignature.set(JSON.parse(lastSignature));
            }
            
            // Sync token holders
            const tokenHolders = localStorage.getItem('memeCoinTokenHolders');
            if (tokenHolders) {
                this.firebaseRefs.tokenHolders.set(JSON.parse(tokenHolders));
            }
            
            // Sync holders snapshots
            const holdersSnapshots = localStorage.getItem('memeCoinHoldersSnapshots');
            if (holdersSnapshots) {
                this.firebaseRefs.holdersSnapshots.set(JSON.parse(holdersSnapshots));
            }
            
            console.log('All state synced to Firebase');
        } catch (error) {
            console.error('Failed to sync to Firebase:', error);
        }
    }

    // Get sync status
    getSyncStatus() {
        return {
            firebaseEnabled: this.firebaseEnabled,
            lastSync: this.config?.system?.lastUpdate || null
        };
    }

    // Universal sync methods for all data types
    syncToFirebase(key, data) {
        if (!this.firebaseEnabled) {
            console.log('Firebase not available for sync');
            return false;
        }

        try {
            const firebaseKey = this.getFirebaseKey(key);
            if (firebaseKey && this.firebaseRefs[firebaseKey]) {
                this.firebaseRefs[firebaseKey].set(data);
                console.log(`${key} synced to Firebase`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Failed to sync ${key} to Firebase:`, error);
            return false;
        }
    }

    // Map localStorage keys to Firebase references
    getFirebaseKey(localStorageKey) {
        const keyMap = {
            'memeCoinDetection': 'detection',
            'memeCoinAdminConfig': 'adminConfig',
            'memeCoinCountdown': 'countdown',
            'memeCoinRewardCountdown': 'rewardCountdown',
            'memeCoinBackendTransactions': 'backendTransactions',
            'memeCoinLargeTransactionNotifications': 'largeTransactionNotifications',
            'memeCoinSuccessAddresses': 'successAddresses',
            'memeCoinLastSignature': 'lastSignature',
            'memeCoinTokenHolders': 'tokenHolders',
            'memeCoinHoldersSnapshots': 'holdersSnapshots'
        };
        return keyMap[localStorageKey];
    }

    // Enhanced localStorage setter with Firebase sync
    setLocalStorageWithSync(key, data) {
        try {
            // Save to localStorage
            localStorage.setItem(key, JSON.stringify(data));
            
            // Sync to Firebase
            this.syncToFirebase(key, data);
            
            return true;
        } catch (error) {
            console.error(`Failed to set ${key}:`, error);
            return false;
        }
    }

    // Enhanced localStorage remover with Firebase sync
    removeLocalStorageWithSync(key) {
        try {
            // Remove from localStorage
            localStorage.removeItem(key);
            
            // Remove from Firebase
            if (this.firebaseEnabled) {
                const firebaseKey = this.getFirebaseKey(key);
                if (firebaseKey && this.firebaseRefs[firebaseKey]) {
                    this.firebaseRefs[firebaseKey].remove();
                    console.log(`${key} removed from Firebase`);
                }
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
            return false;
        }
    }

    // Main Countdown Reward Address Management
    setMainCountdownRewardAddress(address) {
        try {
            this.config.mainCountdownReward.address = address;
            this.config.mainCountdownReward.amount = 100000; // Fixed amount for main countdown
            this.config.mainCountdownReward.isSet = true;
            this.config.mainCountdownReward.lastUpdate = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem('mainCountdownRewardAddress', JSON.stringify({
                address: address,
                amount: 100000,
                isSet: true,
                lastUpdate: new Date().toISOString()
            }));
            
            // Save to Firebase if available
            if (this.firebaseEnabled) {
                this.firebaseRefs.mainCountdownRewards.set({
                    address: address,
                    amount: 100000,
                    isSet: true,
                    lastUpdate: new Date().toISOString()
                });
                console.log('Main countdown reward address saved to Firebase');
            }
            
            // Save config
            this.saveConfig();
            
            console.log(`Main countdown reward address set: ${address}`);
            return true;
        } catch (error) {
            console.error('Failed to set main countdown reward address:', error);
            return false;
        }
    }

    getMainCountdownRewardAddress() {
        try {
            // First try to get from localStorage
            const localData = localStorage.getItem('mainCountdownRewardAddress');
            if (localData) {
                const data = JSON.parse(localData);
                return data;
            }
            
            // Fallback to config
            return this.config.mainCountdownReward;
        } catch (error) {
            console.error('Failed to get main countdown reward address:', error);
            return null;
        }
    }

    clearMainCountdownRewardAddress() {
        try {
            // Clear from config
            this.config.mainCountdownReward.address = '';
            this.config.mainCountdownReward.amount = 100000;
            this.config.mainCountdownReward.isSet = false;
            this.config.mainCountdownReward.lastUpdate = new Date().toISOString();
            
            // Remove from localStorage
            localStorage.removeItem('mainCountdownRewardAddress');
            
            // Remove from Firebase if available
            if (this.firebaseEnabled) {
                this.firebaseRefs.mainCountdownRewards.remove();
                console.log('Main countdown reward address removed from Firebase');
            }
            
            // Save config
            this.saveConfig();
            
            console.log('Main countdown reward address cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear main countdown reward address:', error);
            return false;
        }
    }

    validateSolanaAddress(address) {
        // Basic Solana address validation (44 characters, base58)
        const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return solanaAddressRegex.test(address);
    }

    createMainCountdownRewardForAddress(address) {
        try {
            if (!this.validateSolanaAddress(address)) {
                throw new Error('Invalid Solana address format');
            }

            const rewardData = {
                id: `main_countdown_reward_${Date.now()}`,
                type: 'main-countdown',
                round: 1,
                amount: 100000,
                winner: address,
                timestamp: Date.now(),
                claimed: false,
                createdAt: new Date().toISOString(),
                evidence: {
                    address: address,
                    rewardType: 'main_countdown_winner',
                    eligibilityCriteria: 'admin_configured_address'
                },
                rewardDetails: {
                    rewardType: 'main_countdown_winner',
                    eligibilityCriteria: 'admin_configured_address',
                    winnerDeterminationTime: new Date().toISOString()
                },
                status: {
                    created: true,
                    claimed: false,
                    claimedAt: null,
                    claimTransactionHash: null
                }
            };

            // Save to localStorage
            const existingRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            existingRewards.push(rewardData);
            localStorage.setItem('mainCountdownRewards', JSON.stringify(existingRewards));

            // Save to Firebase if available
            if (this.firebaseEnabled) {
                this.firebaseRefs.mainCountdownRewards.push(rewardData);
                console.log('Main countdown reward created in Firebase');
            }

            console.log(`Main countdown reward created for address: ${address}`);
            return rewardData;
        } catch (error) {
            console.error('Failed to create main countdown reward:', error);
            return null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BackendManager };
} else {
    // Browser environment - expose to global scope
    window.BackendManager = BackendManager;
}

// Make BackendManager available globally
if (typeof window !== 'undefined') {
    window.BackendManager = BackendManager;
} 