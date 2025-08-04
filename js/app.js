/**
 * Main Application
 * Integrates all modules and manages the overall application lifecycle
 */

class MemeCoinApp {
    constructor() {
        this.modules = {
            countdown: null,
            transaction: null,
            ui: null,
            backend: null,
            holders: null,
            wallet: null
        };
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing MemeCoin App...');
            
            // Load all modules
            await this.loadModules();
            
            // Initialize modules
            this.initializeModules();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start the application
            this.start();
            
            this.isInitialized = true;
            console.log('✅ MemeCoin App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize MemeCoin App:', error);
            this.handleInitializationError(error);
        }
    }

    async loadModules() {
        // Load modules in parallel
        const modulePromises = [
            this.loadModule('CountdownManager'),
            this.loadModule('TransactionTracker'),
            this.loadModule('UIEffects'),
            this.loadModule('BackendManager'),
            this.loadModule('TokenHoldersManager'),
            this.loadModule('WalletManager'),
            this.loadModule('WhitepaperModal'),
            this.loadModule('ClaimRewardModal')
        ];

        await Promise.all(modulePromises);
    }

    async loadModule(moduleName) {
        try {
            // In a real application, you would load these from separate files
            // For now, we'll assume they're available globally
            switch (moduleName) {
                case 'CountdownManager':
                    this.modules.countdown = new CountdownManager();
                    break;
                case 'TransactionTracker':
                    this.modules.transaction = new TransactionTracker();
                    break;
                case 'UIEffects':
                    this.modules.ui = new UIEffects();
                    break;
                case 'BackendManager':
                    this.modules.backend = new BackendManager();
                    break;
                case 'TokenHoldersManager':
                    this.modules.holders = new TokenHoldersManager();
                    break;
                case 'WalletManager':
                    this.modules.wallet = new WalletManager();
                    break;
                case 'WhitepaperModal':
                    this.modules.whitepaper = new WhitepaperModal();
                    break;
                case 'ClaimRewardModal':
                    this.modules.claimReward = new ClaimRewardModal();
                    break;
                default:
                    throw new Error(`Unknown module: ${moduleName}`);
            }
            
            console.log(`✅ Loaded module: ${moduleName}`);
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw error;
        }
    }

    initializeModules() {
        // Initialize modules in the correct order
        const initOrder = ['backend', 'countdown', 'transaction', 'ui', 'holders', 'wallet', 'whitepaper', 'claimReward'];
        
        for (const moduleName of initOrder) {
            const module = this.modules[moduleName];
            if (module && typeof module.init === 'function') {
                try {
                    module.init();
                    console.log(`✅ Initialized module: ${moduleName}`);
                } catch (error) {
                    console.error(`❌ Failed to initialize module ${moduleName}:`, error);
                }
            }
        }
    }

    setupEventListeners() {
        // Global event listeners
        window.addEventListener('beforeunload', () => {
            this.destroy();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.onConnectionRestored();
        });

        window.addEventListener('offline', () => {
            this.onConnectionLost();
        });

        // Handle resize events
        window.addEventListener('resize', Utils.debounce(() => {
            this.onWindowResize();
        }, 250));
        
        // Setup global copy functions
        this.setupCopyFunctions();
        
        // Setup button event listeners
        this.setupButtonEventListeners();
    }

    start() {
        console.log('🚀 Starting MemeCoin App...');
        
        // Start all modules
        this.startModules();
        
        // Update UI
        this.updateUI();
        
        // Start periodic updates
        this.startPeriodicUpdates();
        
        console.log('✅ MemeCoin App started successfully');
    }

    startModules() {
        // Start countdown
        if (this.modules.countdown) {
            // Countdown is already started in its init method
        }

        // Start transaction tracking if enabled
        if (this.modules.transaction && this.modules.backend) {
            const detectionConfig = this.modules.backend.getDetectionControl();
            if (detectionConfig && detectionConfig.isRunning) {
                this.modules.transaction.startTracking(detectionConfig.tokenAddress);
            }
        }

        // Start holders fetching if enabled
        if (this.modules.holders && this.modules.backend) {
            const config = this.modules.backend.getConfig();
            if (config && config.token && config.token.address && config.rpc && config.rpc.url) {
                this.modules.holders.startFetchingHolders();
            }
        }
    }

    updateUI() {
        // Update connection status
        this.updateConnectionStatus();
        
        // Update countdown display
        this.updateCountdownDisplay();
        
        // Update transaction display
        this.updateTransactionDisplay();
    }

    startPeriodicUpdates() {
        // Update UI every 5 seconds
        setInterval(() => {
            this.updateUI();
        }, 5000);

        // Update system status every 30 seconds
        setInterval(() => {
            this.updateSystemStatus();
        }, 30000);
    }

    // Event handlers
    onPageHidden() {
        console.log('📱 Page hidden - pausing non-essential operations');
        // Pause non-essential operations
    }

    onPageVisible() {
        console.log('📱 Page visible - resuming operations');
        // Resume operations
        this.updateUI();
    }

    onConnectionRestored() {
        console.log('🌐 Connection restored');
        this.updateConnectionStatus();
        
        // Reconnect to Solana if needed
        if (this.modules.transaction) {
            this.modules.transaction.checkDetectionControl();
        }
    }

    onConnectionLost() {
        console.log('🌐 Connection lost');
        this.updateConnectionStatus();
    }

    onWindowResize() {
        // Handle responsive design updates
        this.updateResponsiveLayout();
    }
    
    setupCopyFunctions() {
        // Add global copy functions to window
        window.copyAddress = (address) => {
            navigator.clipboard.writeText(address).then(() => {
                this.showCopyNotification('Address copied!');
            }).catch(() => {
                this.showCopyNotification('Failed to copy address');
            });
        };
        
        window.copySignature = (signature) => {
            navigator.clipboard.writeText(signature).then(() => {
                this.showCopyNotification('Signature copied!');
            }).catch(() => {
                this.showCopyNotification('Failed to copy signature');
            });
        };
    }

    setupButtonEventListeners() {
        // Whitepaper button
        const whitepaperBtn = document.getElementById('whitepaperBtn');
        if (whitepaperBtn) {
            whitepaperBtn.addEventListener('click', () => {
                console.log('📄 Opening whitepaper...');
                if (this.modules.whitepaper) {
                    this.modules.whitepaper.show();
                } else {
                    console.error('❌ WhitepaperModal not initialized');
                    this.showErrorMessage('Whitepaper module not available');
                }
            });
        }

        // Claim reward button
        const claimRewardBtn = document.getElementById('claimRewardBtn');
        if (claimRewardBtn) {
            claimRewardBtn.addEventListener('click', () => {
                console.log('🎁 Opening claim reward modal...');
                if (this.modules.claimReward) {
                    this.modules.claimReward.show();
                } else {
                    console.error('❌ ClaimRewardModal not initialized');
                    this.showErrorMessage('Claim reward module not available');
                }
            });
        }

        // Wallet connect button
        const walletConnectBtn = document.getElementById('walletConnectBtn');
        if (walletConnectBtn) {
            walletConnectBtn.addEventListener('click', () => {
                console.log('🔗 Opening wallet connection modal...');
                if (this.modules.wallet) {
                    this.modules.wallet.showConnectionModal();
                } else {
                    console.error('❌ WalletManager not initialized');
                    this.showErrorMessage('Wallet module not available');
                }
            });
        }
    }
    
    showCopyNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // Update methods
    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            if (navigator.onLine) {
                statusElement.innerHTML = '🟢 Online';
            } else {
                statusElement.innerHTML = '🔴 Offline';
            }
        }
    }

    updateCountdownDisplay() {
        // Countdown updates are handled by the CountdownManager module
        // This method can be used for additional countdown-related UI updates
    }

    updateTransactionDisplay() {
        // Transaction updates are handled by the TransactionTracker module
        // This method can be used for additional transaction-related UI updates
    }

    updateSystemStatus() {
        if (this.modules.backend) {
            this.modules.backend.updateSystemStatus();
        }
    }

    updateResponsiveLayout() {
        // Handle responsive design updates
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        // Add responsive classes to body
        document.body.classList.toggle('mobile', isMobile);
        document.body.classList.toggle('tablet', isTablet);
        document.body.classList.toggle('desktop', !isMobile && !isTablet);
    }

    // Module access methods
    getCountdownManager() {
        return this.modules.countdown;
    }

    getTransactionTracker() {
        return this.modules.transaction;
    }

    getUIEffects() {
        return this.modules.ui;
    }

    getBackendManager() {
        return this.modules.backend;
    }

    getTokenHoldersManager() {
        return this.modules.holders;
    }
    
    getWalletManager() {
        return this.modules.wallet;
    }

    getWhitepaperModal() {
        return this.modules.whitepaper;
    }

    getClaimRewardModal() {
        return this.modules.claimReward;
    }

    // Configuration methods
    updateConfig(config) {
        if (this.modules.backend) {
            // Update backend configuration
            if (config.rpc) {
                this.modules.backend.updateRPCConfig(config.rpc.url, config.rpc.connected);
            }
            if (config.token) {
                this.modules.backend.updateTokenConfig(config.token.address, config.token.name, config.token.validated);
            }
            if (config.countdown) {
                this.modules.backend.updateCountdownConfig(config.countdown.minutes, config.countdown.seconds, config.countdown.message);
            }
            if (config.rewardCountdown) {
                this.modules.backend.updateRewardCountdownConfig(config.rewardCountdown.minutes, config.rewardCountdown.seconds);
            }
            if (config.detection) {
                this.modules.backend.updateDetectionConfig(config.detection.isRunning, config.detection.rpcUrl, config.detection.tokenAddress);
            }
        }
    }

    getConfig() {
        if (this.modules.backend) {
            return this.modules.backend.config;
        }
        return null;
    }

    // Error handling
    handleInitializationError(error) {
        console.error('Application initialization failed:', error);
        
        // Show error message to user
        this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        
        // Log error for debugging
        if (typeof error === 'object' && error.message) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>❌ Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(errorDiv);
    }

    // Cleanup
    destroy() {
        console.log('🛑 Destroying MemeCoin App...');
        
        // Destroy all modules
        for (const [name, module] of Object.entries(this.modules)) {
            if (module && typeof module.destroy === 'function') {
                try {
                    module.destroy();
                    console.log(`✅ Destroyed module: ${name}`);
                } catch (error) {
                    console.error(`❌ Failed to destroy module ${name}:`, error);
                }
            }
        }
        
        // Clear intervals
        if (this.updateIntervals) {
            this.updateIntervals.forEach(interval => clearInterval(interval));
        }
        
        console.log('✅ MemeCoin App destroyed successfully');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.memeCoinApp = new MemeCoinApp();
    
    // Make app available globally for debugging
    console.log('🌐 MemeCoin App available as window.memeCoinApp');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MemeCoinApp };
} else {
    // Browser environment - expose to global scope
    window.MemeCoinApp = MemeCoinApp;
}