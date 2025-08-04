// Countdown configuration
const COUNTDOWN_CONFIG = {
    minutes: 5, // Countdown minutes
    updateInterval: 1000, // Update interval (milliseconds)
    storageKey: 'memeCoinCountdown' // Local storage key
};

// QuickNode RPC configuration
const QUICKNODE_CONFIG = {
    pollingInterval: 5000, // Polling interval (milliseconds)
    maxTransactions: 50, // Maximum displayed transactions
    retryAttempts: 3 // Retry attempts
};

// Countdown class
class CountdownTimer {
    constructor() {
        this.targetDate = null;
        this.interval = null;
        this.isRunning = false;
        this.syncInterval = null;
    }

    // Initialize countdown
    init() {
        this.loadCountdownFromStorage();
        this.startSyncWithAdmin();
        this.start();
    }

    // Load countdown from storage
    loadCountdownFromStorage() {
        const stored = localStorage.getItem(COUNTDOWN_CONFIG.storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.targetDate = new Date(data.targetDate);
                console.log('Loaded countdown from storage:', this.targetDate);
            } catch (error) {
                console.error('Failed to load countdown:', error);
                this.setDefaultCountdown();
            }
        } else {
            this.setDefaultCountdown();
        }
    }

    // Set default countdown
    setDefaultCountdown() {
        const now = new Date();
        this.targetDate = new Date(now.getTime() + COUNTDOWN_CONFIG.minutes * 60 * 1000);
        this.saveCountdownToStorage();
    }

    // Save countdown to storage
    saveCountdownToStorage() {
        const data = {
            targetDate: this.targetDate.toISOString(),
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem(COUNTDOWN_CONFIG.storageKey, JSON.stringify(data));
    }

    // Start synchronization with admin
    startSyncWithAdmin() {
        // Check admin configuration updates every 5 seconds
        this.syncInterval = setInterval(() => {
            this.checkAdminUpdates();
        }, 5000);
    }

    // Check admin updates
    checkAdminUpdates() {
        const adminConfig = localStorage.getItem('memeCoinAdminConfig');
        if (adminConfig) {
            try {
                const config = JSON.parse(adminConfig);
                if (config.countdown && config.countdown.lastUpdate) {
                    const adminUpdateTime = new Date(config.countdown.lastUpdate);
                    const currentUpdateTime = new Date(this.getLastUpdateTime());
                    
                    if (adminUpdateTime > currentUpdateTime) {
                        console.log('Detected admin countdown update, reloading...');
                        this.loadCountdownFromStorage();
                        this.updateSyncStatus('🟢 Synced');
                    }
                }
            } catch (error) {
                console.error('Failed to check admin updates:', error);
                this.updateSyncStatus('🟡 Sync error');
            }
        } else {
            this.updateSyncStatus('🔴 Not connected');
        }
    }

    // Update sync status
    updateSyncStatus(status) {
        const syncStatusElement = document.getElementById('syncStatus');
        if (syncStatusElement) {
            syncStatusElement.textContent = status;
        }
    }

    // Get last update time
    getLastUpdateTime() {
        const stored = localStorage.getItem(COUNTDOWN_CONFIG.storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                return data.lastUpdate || new Date().toISOString();
            } catch (error) {
                return new Date().toISOString();
            }
        }
        return new Date().toISOString();
    }

    // Start countdown
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.update();
        this.interval = setInterval(() => this.update(), COUNTDOWN_CONFIG.updateInterval);
    }

    // Stop countdown
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.isRunning = false;
    }

    // Update countdown display
    update() {
        const now = new Date();
        const timeLeft = this.targetDate - now;

        if (timeLeft <= 0) {
            this.showLaunchMessage();
            this.stop();
            // Auto restart countdown after 3 seconds
            setTimeout(() => {
                this.restartCountdown();
            }, 3000);
            return;
        }

        const timeUnits = this.calculateTimeUnits(timeLeft);
        this.updateDisplay(timeUnits);
    }

    // Calculate time units
    calculateTimeUnits(timeLeft) {
        const minutes = Math.floor(timeLeft / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        return { minutes, seconds };
    }

    // Update display
    updateDisplay(timeUnits) {
        const elements = {
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };

        Object.keys(elements).forEach(unit => {
            if (elements[unit]) {
                elements[unit].textContent = timeUnits[unit].toString().padStart(2, '0');
            }
        });
    }

    // Show launch message
    showLaunchMessage() {
        // 显示奖励领取弹窗，不改变倒计时样式
        this.showRewardClaimModal();
        console.log('Main countdown ended - showing reward claim modal');
    }

    showRewardClaimModal() {
        // 创建奖励领取弹窗
        const modal = document.createElement('div');
        modal.id = 'rewardClaimModal';
        modal.className = 'reward-claim-modal';
        modal.innerHTML = `
            <div class="reward-claim-content">
                <div class="reward-claim-header">
                    <h2>🎉 Round Complete!</h2>
                    <button class="reward-claim-close" onclick="this.closest('.reward-claim-modal').remove()">×</button>
                </div>
                <div class="reward-claim-body">
                    <div class="reward-claim-icon">🏆</div>
                    <h3>Congratulations!</h3>
                    <p>This round has ended. Please check if you've won any rewards!</p>
                    <div class="reward-claim-buttons">
                        <button class="reward-claim-btn primary" onclick="this.closest('.reward-claim-modal').remove(); window.open('claim-reward.html', '_blank');">
                            🎁 Claim Rewards
                        </button>
                        <button class="reward-claim-btn secondary" onclick="this.closest('.reward-claim-modal').remove();">
                            Continue Watching
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 自动关闭弹窗（10秒后）
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 10000);
    }

    // Restart countdown to initial state (5 minutes)
    restartCountdown() {
        console.log('Restarting countdown to initial state (5 minutes)');
        this.setDefaultCountdown();
        this.start();
        
        // 只更新倒计时数字，不改变界面结构
        // 保持现有的倒计时界面样式不变
        console.log('Countdown restarted - keeping existing interface style');
    }
}

// QuickNode RPC management class
class QuickNodeRPCManager {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.isTracking = false;
        this.trackingInterval = null;
        this.tokenAddress = null;
        this.transactions = [];
        this.totalTransactions = 0;
        this.lastBlockTime = null;
    }

    // Connect to QuickNode RPC
    async connect(rpcUrl) {
        try {
            this.updateConnectionStatus('connecting');
            
            // Create Solana connection
            this.connection = new solanaWeb3.Connection(rpcUrl, 'confirmed');
            
            // Test connection
            const version = await this.connection.getVersion();
                          console.log('Solana RPC version:', version);
            
            this.isConnected = true;
            this.updateConnectionStatus('connected');
            this.updateRPCStatus('Connected');
            return true;
        } catch (error) {
            console.error('QuickNode connection failed:', error);
            this.updateConnectionStatus('disconnected');
            this.updateRPCStatus('Connection failed');
            return false;
        }
    }

    // Start tracking token transactions
    async startTracking(tokenAddress) {
        if (!this.isConnected || !tokenAddress) {
            console.error('Not connected or token address invalid');
            return false;
        }

        this.tokenAddress = tokenAddress;
        this.isTracking = true;
                    this.updateDetectionStatus('🔵 Detecting...');
        this.updateCurrentTokenAddress(tokenAddress);

                    // Start polling
        this.trackingInterval = setInterval(() => {
            this.pollTransactions();
        }, QUICKNODE_CONFIG.pollingInterval);

        return true;
    }

    // Stop tracking
    stopTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
        this.isTracking = false;
                    this.updateDetectionStatus('🔴 Stopped');
    }

    // Poll transactions
    async pollTransactions() {
        try {
            // Get latest block
            const slot = await this.connection.getSlot();
            const block = await this.connection.getBlock(slot, {
                maxSupportedTransactionVersion: 0
            });

            if (block && block.transactions) {
                // Filter transactions containing target token address
                const relevantTransactions = block.transactions.filter(tx => {
                    return tx.meta && tx.meta.postTokenBalances && 
                           tx.meta.postTokenBalances.some(balance => 
                               balance.mint === this.tokenAddress
                           );
                });

                // Process relevant transactions
                for (const tx of relevantTransactions) {
                    await this.processTransaction(tx, block.blockTime);
                }
            }

            this.updateLastUpdate();
        } catch (error) {
            console.error('Failed to poll transactions:', error);
        }
    }

    // Process single transaction
    async processTransaction(tx, blockTime) {
        try {
            const signature = tx.transaction.signatures[0];
            
            // Check if transaction with same signature already exists (prevent duplicate detection)
            if (this.isTransactionDuplicate(signature)) {
                                  console.log('Skipping duplicate transaction:', signature);
                return;
            }

            const transactionData = {
                signature: signature,
                blockTime: blockTime,
                status: tx.meta.err ? 'failed' : 'success',
                amount: this.extractTokenAmount(tx),
                timestamp: new Date().toLocaleTimeString(),
                type: this.determineTransactionType(tx),
                trader: this.extractTraderAddress(tx),
                processedAt: new Date().toISOString()
            };

            // Add to transaction list
            this.transactions.unshift(transactionData);
            this.totalTransactions++;

            // Limit transaction list to 100 entries
            if (this.transactions.length > 100) {
                this.transactions = this.transactions.slice(0, 100);
            }

            // Update UI
            this.updateTransactionList();
            this.updateTransactionStats();
            this.updateTransactionTable();
            
            // Save transaction data to localStorage for admin viewing
            this.saveTransactionsToStorage();

            // Upload transaction record to backend
            this.uploadTransactionToBackend(transactionData);

        } catch (error) {
            console.error('Failed to process transaction:', error);
        }
    }

    // Check if transaction is duplicate
    isTransactionDuplicate(signature) {
        return this.transactions.some(tx => tx.signature === signature);
    }

    // Upload transaction record to backend
    uploadTransactionToBackend(transactionData) {
        try {
            // Get existing backend transaction records
            const backendTransactions = this.getBackendTransactions();
            
            // Check if backend already has transaction with same signature
            if (backendTransactions.some(tx => tx.signature === transactionData.signature)) {
                                  console.log('Backend already has same transaction, skipping upload:', transactionData.signature);
                return;
            }

            // Add new transaction to backend records
            backendTransactions.unshift(transactionData);
            
            // Limit backend records to 100 entries
            if (backendTransactions.length > 100) {
                backendTransactions.splice(100);
            }

            // Save to localStorage
            const backendData = {
                transactions: backendTransactions,
                totalCount: backendTransactions.length,
                lastUpdate: new Date().toISOString(),
                lastUpload: new Date().toISOString()
            };
            
            localStorage.setItem('memeCoinBackendTransactions', JSON.stringify(backendData));
                            console.log('Transaction record uploaded to backend:', transactionData.signature);
            
        } catch (error) {
            console.error('Failed to upload transaction record to backend:', error);
        }
    }

    // Get backend transaction records
    getBackendTransactions() {
        try {
            const saved = localStorage.getItem('memeCoinBackendTransactions');
            return saved ? JSON.parse(saved).transactions || [] : [];
        } catch (error) {
            console.error('Failed to get backend transaction records:', error);
            return [];
        }
    }

    // Save transaction data to storage
    saveTransactionsToStorage() {
        try {
            const transactionData = {
                transactions: this.transactions,
                totalCount: this.totalTransactions,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('memeCoinTransactions', JSON.stringify(transactionData));
        } catch (error) {
            console.error('Failed to save transaction data:', error);
        }
    }

    // Extract token amount
    extractTokenAmount(tx) {
        try {
            if (tx.meta && tx.meta.postTokenBalances) {
                const tokenBalance = tx.meta.postTokenBalances.find(balance => 
                    balance.mint === this.tokenAddress
                );
                
                if (tokenBalance) {
                    return (tokenBalance.uiTokenAmount.uiAmount || 0).toFixed(2);
                }
            }
            return '0.00';
        } catch (error) {
            console.error('Failed to extract token amount:', error);
            return '0.00';
        }
    }

    // Determine transaction type
    determineTransactionType(tx) {
        // Here you can determine if it's a buy or sell based on transaction data
        return 'Buy'; // Simplified processing
    }

    // Extract trader address
    extractTraderAddress(tx) {
        try {
            if (tx.transaction.message.accountKeys && tx.transaction.message.accountKeys.length > 0) {
                return tx.transaction.message.accountKeys[0].toString().substring(0, 8) + '...';
            }
            return 'Unknown';
        } catch (error) {
            return 'Unknown';
        }
    }

    // Update connection status
    updateConnectionStatus(status) {
        const statusDot = document.getElementById('connectionStatus');
        const statusText = document.getElementById('statusText');

        if (statusDot && statusText) {
            statusDot.className = 'status-dot';
            
            switch (status) {
                case 'connected':
                    statusDot.classList.add('connected');
                    statusText.textContent = 'Connected';
                    break;
                case 'connecting':
                    statusDot.classList.add('connecting');
                    statusText.textContent = 'Connecting...';
                    break;
                case 'disconnected':
                    statusText.textContent = 'Connection failed';
                    break;
                default:
                    statusText.textContent = 'Not connected';
            }
        }
    }

    // Update detection status
    updateDetectionStatus(status) {
        const detectionStatus = document.getElementById('detectionStatus');
        if (detectionStatus) {
            detectionStatus.textContent = status;
        }
    }

    // Update RPC status
    updateRPCStatus(status) {
        const rpcStatus = document.getElementById('rpcStatus');
        if (rpcStatus) {
            rpcStatus.textContent = status;
        }
    }

    // Update current token address
    updateCurrentTokenAddress(address) {
        const currentTokenAddress = document.getElementById('currentTokenAddress');
        if (currentTokenAddress) {
            currentTokenAddress.value = address;
        }
    }

    // Update last update time
    updateLastUpdate() {
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            lastUpdate.textContent = new Date().toLocaleTimeString();
        }
    }

    // Update transaction statistics
    updateTransactionStats() {
        const totalTransactions = document.getElementById('totalTransactions');
        if (totalTransactions) {
            totalTransactions.textContent = this.totalTransactions;
        }
    }

    // Update transaction list
    updateTransactionList() {
        const transactionLog = document.getElementById('transactionLog');
        if (!transactionLog) return;

        if (this.transactions.length === 0) {
            transactionLog.innerHTML = '<div class="log-placeholder">Waiting for transaction detection...</div>';
            return;
        }

        const logHTML = this.transactions.slice(0, 10).map(tx => `
            <div class="log-entry">
                <span class="log-time">${tx.timestamp}</span>
                <span class="log-type">${tx.type}</span>
                <span class="log-amount">${tx.amount}</span>
                <span class="log-status ${tx.status}">${tx.status === 'success' ? 'Success' : 'Failed'}</span>
            </div>
        `).join('');

        transactionLog.innerHTML = logHTML;
    }

    // Update transaction table
    updateTransactionTable() {
        const tableBody = document.getElementById('transactionTableBody');
        const recordCount = document.getElementById('recordCount');
        
        if (recordCount) {
            recordCount.textContent = `${this.transactions.length} records`;
        }

        if (!tableBody) return;

        if (this.transactions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="no-records">No transaction records yet</td></tr>';
            return;
        }

        const tableHTML = this.transactions.map(tx => `
            <tr>
                <td>${tx.timestamp}</td>
                <td>${tx.type}</td>
                <td>${tx.amount}</td>
                <td>${tx.trader}</td>
                <td class="tx-hash" title="${tx.signature}">
                    ${tx.signature.substring(0, 8)}...${tx.signature.substring(tx.signature.length - 8)}
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = tableHTML;
    }
}

// Interaction effects class
class InteractionEffects {
    constructor() {
        this.init();
    }

    // Initialize interaction effects
    init() {
        this.addClickEffects();
        this.addHoverEffects();
    }

    // Add click effects
    addClickEffects() {
        const interactiveElements = document.querySelectorAll('button, a');
        
        interactiveElements.forEach(element => {
            element.addEventListener('click', (e) => {
                // Prevent default link behavior
                if (element.tagName === 'A') {
                    e.preventDefault();
                }
                
                this.addClickAnimation(element);
            });
        });
    }

    // Add click animation
    addClickAnimation(element) {
        element.classList.add('scale-90');
        setTimeout(() => {
            element.classList.remove('scale-90');
        }, 150);
    }

    // Add hover effects
    addHoverEffects() {
        // Here you can add more hover effects
        console.log('Hover effects initialized');
    }
}

// Social media sharing class
class SocialMediaShare {
    constructor() {
        this.platforms = {
            twitter: {
                url: 'https://twitter.com/intent/tweet',
                params: {
                    text: '🚀 Check out this amazing meme coin countdown! TO THE MOON! 🚀',
                    url: window.location.href,
                    hashtags: 'memecoin,crypto,moontoken'
                }
            },
            facebook: {
                url: 'https://www.facebook.com/sharer/sharer.php',
                params: {
                    u: window.location.href
                }
            },
            telegram: {
                url: 'https://t.me/share/url',
                params: {
                    url: window.location.href,
                    text: '🚀 Amazing meme coin countdown! TO THE MOON! 🚀'
                }
            }
        };
        
        this.init();
    }

    // Initialize social media sharing
    init() {
        this.setupShareButtons();
    }

    // Setup share buttons
    setupShareButtons() {
        const shareButtons = document.querySelectorAll('.social-link');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = this.getPlatformFromButton(button);
                if (platform && this.platforms[platform]) {
                    this.share(platform);
                }
            });
        });
    }

    // Get platform from button
    getPlatformFromButton(button) {
        const classes = button.className.split(' ');
        for (const className of classes) {
            if (this.platforms[className]) {
                return className;
            }
        }
        return null;
    }

    // Share to specified platform
    share(platform) {
        const platformConfig = this.platforms[platform];
        const params = new URLSearchParams(platformConfig.params);
        const shareUrl = `${platformConfig.url}?${params.toString()}`;
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Fixed panel management class
class FixedPanelManager {
    constructor() {
        // Initialize reward countdown properties
        this.rewardMinutes = 20;
        this.rewardSeconds = 0;
        this.init();
    }

    // Initialize fixed panels
    init() {
        this.setupRewardCountdown();
        this.setupRefreshCountdown();
        this.setupWalletConnection();
    }

    // Setup reward countdown
    setupRewardCountdown() {
        const rewardCountdown = document.getElementById('rewardCountdown');
        if (!rewardCountdown) return;

        // Load reward countdown from backend or set default (20 minutes)
        this.loadRewardCountdownFromBackend();
        
        // Immediately save the current state to ensure persistence
        this.saveRewardCountdownToBackend();
        
        // Update reward countdown every second
        setInterval(() => {
            this.updateRewardCountdown();
        }, 1000);
    }

    // Load reward countdown from backend
    loadRewardCountdownFromBackend() {
        const adminConfig = localStorage.getItem('memeCoinAdminConfig');
        if (adminConfig) {
            try {
                const config = JSON.parse(adminConfig);
                if (config.rewardCountdown) {
                    this.rewardMinutes = config.rewardCountdown.minutes || 20;
                    this.rewardSeconds = config.rewardCountdown.seconds || 0;
                    console.log('Loaded reward countdown from backend:', this.rewardMinutes, this.rewardSeconds);
                    // Save the loaded state back to ensure persistence
                    this.saveRewardCountdownToBackend();
                    return;
                }
            } catch (error) {
                console.error('Failed to load reward countdown from backend:', error);
            }
        }
        
        // Set default values and save them
        this.rewardMinutes = 20;
        this.rewardSeconds = 0;
        console.log('Set default reward countdown:', this.rewardMinutes, this.rewardSeconds);
        // Save default values to backend
        this.saveRewardCountdownToBackend();
    }

    // Update reward countdown
    updateRewardCountdown() {
        const rewardCountdown = document.getElementById('rewardCountdown');
        if (!rewardCountdown) return;

        if (this.rewardSeconds === 0) {
            if (this.rewardMinutes === 0) {
                // Reset to backend configured time
                this.loadRewardCountdownFromBackend();
                this.saveRewardCountdownToBackend();
            } else {
                this.rewardMinutes--;
                this.rewardSeconds = 59;
            }
        } else {
            this.rewardSeconds--;
        }

        rewardCountdown.textContent = `${this.rewardMinutes.toString().padStart(2, '0')}:${this.rewardSeconds.toString().padStart(2, '0')}`;
        
        // Save to backend every 10 seconds
        if (this.rewardSeconds % 10 === 0) {
            this.saveRewardCountdownToBackend();
        }
    }

    // Save reward countdown to backend
    saveRewardCountdownToBackend() {
        try {
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            let config = adminConfig ? JSON.parse(adminConfig) : {};
            
            config.rewardCountdown = {
                minutes: this.rewardMinutes,
                seconds: this.rewardSeconds,
                lastUpdate: new Date().toISOString()
            };
            
            localStorage.setItem('memeCoinAdminConfig', JSON.stringify(config));
            console.log('Saved reward countdown to backend:', this.rewardMinutes, this.rewardSeconds);
        } catch (error) {
            console.error('Failed to save reward countdown to backend:', error);
        }
    }

    // Setup refresh countdown
    setupRefreshCountdown() {
        const refreshCount = document.getElementById('refreshCount');
        if (!refreshCount) return;

        let count = 10;
        setInterval(() => {
            count = count === 0 ? 10 : count - 1;
            refreshCount.textContent = count;
        }, 1000);
    }

    // Setup wallet connection
    setupWalletConnection() {
        const walletConnectBtn = document.querySelector('.wallet-connect-btn');
        const statusText = document.querySelector('.status-text');

        if (walletConnectBtn && statusText) {
            walletConnectBtn.addEventListener('click', () => {
                // Simulate wallet connection
                                  statusText.textContent = 'Connected';
                                  walletConnectBtn.textContent = '🔗 Connected';
                walletConnectBtn.style.backgroundColor = '#4ade80';
            });
        }
    }
}

// Utility functions
class Utils {
    // Format number to two digits
    static padZero(num) {
        return num.toString().padStart(2, '0');
    }

    // Debounce function
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

    // Throttle function
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
}

// Main application class
class MemeCoinCountdownApp {
    constructor() {
        this.countdownTimer = null;
        this.quickNodeRPC = null;
        this.interactionEffects = null;
        this.socialMediaShare = null;
        this.fixedPanelManager = null;
    }

    // Initialize application
    init() {
        this.setupCountdown();
        this.setupQuickNodeRPC();
        this.setupInteractions();
        this.setupSocialMedia();
        this.setupFixedPanels();
        
        // Check detection control
        this.checkDetectionControl();
        
        // Periodically check detection control updates
        setInterval(() => {
            this.checkDetectionControl();
        }, 3000);
        
        console.log('Meme Coin Countdown App initialized! 🚀');
    }

    // Setup countdown
    setupCountdown() {
        this.countdownTimer = new CountdownTimer();
        this.countdownTimer.init();
    }

    // Setup QuickNode RPC
    setupQuickNodeRPC() {
        this.quickNodeRPC = new QuickNodeRPCManager();
        this.loadAdminConfig();
    }

    // Load admin configuration
    loadAdminConfig() {
        const adminConfig = localStorage.getItem('memeCoinAdminConfig');
        if (adminConfig) {
            try {
                const config = JSON.parse(adminConfig);
                if (config.rpc && config.rpc.url && config.token && config.token.address) {
                    // Auto-connect RPC and start tracking
                    this.autoStartTracking(config.rpc.url, config.token.address);
                }
            } catch (error) {
                console.error('Failed to load admin configuration:', error);
            }
        }
    }

    // Auto-start tracking
    async autoStartTracking(rpcUrl, tokenAddress) {
        try {
            const connected = await this.quickNodeRPC.connect(rpcUrl);
            if (connected) {
                await this.quickNodeRPC.startTracking(tokenAddress);
                console.log('Auto-started tracking transactions');
            }
        } catch (error) {
            console.error('Auto-start tracking failed:', error);
        }
    }

    // Check detection control
    checkDetectionControl() {
        const detectionConfig = localStorage.getItem('memeCoinDetection');
        if (detectionConfig) {
            try {
                const config = JSON.parse(detectionConfig);
                if (config.isRunning && config.rpcUrl && config.tokenAddress) {
                    // Start detection
                    this.autoStartTracking(config.rpcUrl, config.tokenAddress);
                    this.updateDetectionStatus('running', 'Detecting...');
                                  } else {
                      // Stop detection
                    if (this.quickNodeRPC) {
                        this.quickNodeRPC.stopTracking();
                    }
                                            this.updateDetectionStatus('stopped', 'Stopped');
                }
            } catch (error) {
                console.error('Failed to parse detection configuration:', error);
            }
        } else {
            // No detection configuration, stop detection
            if (this.quickNodeRPC) {
                this.quickNodeRPC.stopTracking();
            }
            this.updateDetectionStatus('stopped', 'Waiting to start');
        }
    }

    // Update detection status
    updateDetectionStatus(status, text) {
        const detectionStatusElement = document.getElementById('detectionStatus');
        if (detectionStatusElement) {
            if (status === 'running') {
                detectionStatusElement.innerHTML = '🟢 ' + text;
            } else if (status === 'stopped') {
                detectionStatusElement.innerHTML = '🔴 ' + text;
            } else {
                detectionStatusElement.innerHTML = '🟡 ' + text;
            }
        }
    }

    // Setup interaction effects
    setupInteractions() {
        this.interactionEffects = new InteractionEffects();
    }

    // Setup social media
    setupSocialMedia() {
        this.socialMediaShare = new SocialMediaShare();
    }

    // Setup fixed panels
    setupFixedPanels() {
        this.fixedPanelManager = new FixedPanelManager();
    }

    // Destroy application
    destroy() {
        if (this.countdownTimer) {
            this.countdownTimer.stop();
        }
        if (this.quickNodeRPC) {
            this.quickNodeRPC.stopTracking();
        }
    }
}

// Initialize application after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MemeCoinCountdownApp();
    app.init();
    
    // Mount application instance to global for debugging
    window.memeCoinApp = app;
});

// Clean up resources when page unloads
window.addEventListener('beforeunload', () => {
    if (window.memeCoinApp) {
        window.memeCoinApp.destroy();
    }
}); 