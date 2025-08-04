// Admin Management System Configuration
const ADMIN_CONFIG = {
    version: 'v1.0.0',
    storageKey: 'memeCoinAdminConfig',
    logMaxEntries: 100
};

// Global event listener binding function - specifically solves Vercel deployment issues
function bindEventListenersWithRetry() {
    console.log('Attempting to bind event listeners...');
    
    // Define all buttons and events that need to be bound
    const buttonEvents = [
        { id: 'resetCountdownBtn', event: 'click', handler: 'resetCountdown' },
        { id: 'saveCountdownBtn', event: 'click', handler: 'saveCountdownConfig' },
        { id: 'testRpcBtn', event: 'click', handler: 'testRpcConnection' },
        { id: 'saveRpcBtn', event: 'click', handler: 'saveRpcConfig' },
        { id: 'validateTokenBtn', event: 'click', handler: 'validateTokenAddress' },
        { id: 'saveTokenBtn', event: 'click', handler: 'saveTokenConfig' },
        { id: 'resetRewardCountdownBtn', event: 'click', handler: 'resetRewardCountdown' },
        { id: 'saveRewardCountdownBtn', event: 'click', handler: 'saveRewardCountdownConfig' },
        { id: 'startDetectionBtn', event: 'click', handler: 'startDetection' },
        { id: 'stopDetectionBtn', event: 'click', handler: 'stopDetection' },
        { id: 'refreshDetectionBtn', event: 'click', handler: 'refreshDetectionStatus' },
        { id: 'viewTransactionsBtn', event: 'click', handler: 'viewTransactions' },
        { id: 'clearTransactionsBtn', event: 'click', handler: 'clearTransactions' },
        { id: 'exportTransactionsBtn', event: 'click', handler: 'exportTransactions' },
        { id: 'viewLargeTransactionsBtn', event: 'click', handler: 'viewLargeTransactions' },
        { id: 'clearLargeTransactionsBtn', event: 'click', handler: 'clearLargeTransactions' },
        { id: 'exportLargeTransactionsBtn', event: 'click', handler: 'exportLargeTransactions' },
        { id: 'viewSuccessAddressesBtn', event: 'click', handler: 'viewSuccessAddresses' },
        { id: 'clearSuccessAddressesBtn', event: 'click', handler: 'clearSuccessAddresses' },
        { id: 'exportSuccessAddressesBtn', event: 'click', handler: 'exportSuccessAddresses' },
        { id: 'viewHoldersSnapshotsBtn', event: 'click', handler: 'viewHoldersSnapshots' },
        { id: 'exportHoldersSnapshotsBtn', event: 'click', handler: 'exportHoldersSnapshots' },
        { id: 'fixHoldingRewardsBtn', event: 'click', handler: 'fixHoldingRewardsFromSnapshots' },
        { id: 'createTestRewardsBtn', event: 'click', handler: 'createTestHoldingRewards' },
        { id: 'createTestMainCountdownBtn', event: 'click', handler: 'createTestMainCountdownRewards' },
        { id: 'clearHoldersSnapshotsBtn', event: 'click', handler: 'clearHoldersSnapshots' },
        { id: 'viewMainCountdownSnapshotsBtn', event: 'click', handler: 'viewMainCountdownSnapshots' },
        { id: 'exportMainCountdownSnapshotsBtn', event: 'click', handler: 'exportMainCountdownSnapshots' },
        { id: 'fixMainCountdownRewardsBtn', event: 'click', handler: 'fixMainCountdownRewardsFromSnapshots' },
        { id: 'createTestMainCountdownSnapshotBtn', event: 'click', handler: 'createTestMainCountdownSnapshot' },
        { id: 'clearMainCountdownSnapshotsBtn', event: 'click', handler: 'clearMainCountdownSnapshots' },
        { id: 'viewRewardDataBtn', event: 'click', handler: 'viewRewardData' },
        { id: 'exportRewardDataBtn', event: 'click', handler: 'exportRewardData' },
        { id: 'viewRewardHistoryBtn', event: 'click', handler: 'viewRewardHistory' },
        { id: 'clearRewardDataBtn', event: 'click', handler: 'clearRewardData' },
        { id: 'saveAllBtn', event: 'click', handler: 'saveAllConfig' },
        { id: 'refreshBtn', event: 'click', handler: 'refreshStatus' },
        { id: 'clearCacheBtn', event: 'click', handler: 'clearCache' },
        { id: 'exportConfigBtn', event: 'click', handler: 'exportConfig' },
        { id: 'clearLogBtn', event: 'click', handler: 'clearLog' },
        { id: 'exportLogBtn', event: 'click', handler: 'exportLog' },
        { id: 'validateRewardAddressBtn', event: 'click', handler: 'validateRewardAddress' },
        { id: 'clearRewardBtn', event: 'click', handler: 'clearRewardAddress' },
        { id: 'saveRewardAddressBtn', event: 'click', handler: 'saveRewardAddressConfig' },
        { id: 'modalClose', event: 'click', handler: 'closeModal' },
        { id: 'modalCancel', event: 'click', handler: 'closeModal' }
    ];
    
    let boundCount = 0;
    let totalButtons = buttonEvents.length;
    
    buttonEvents.forEach(({ id, event, handler }) => {
        const element = document.getElementById(id);
        if (element) {
            // Remove existing event listeners (prevent duplicate binding)
            element.removeEventListener(event, window.adminApp?.configManager?.[handler]);
            
            // Add new event listeners
            element.addEventListener(event, async () => {
                console.log(`Button ${id} clicked, calling ${handler}`);
                if (window.adminApp?.configManager?.[handler]) {
                    try {
                        const result = window.adminApp.configManager[handler]();
                        // If it's an async function, wait for it to complete
                        if (result && typeof result.then === 'function') {
                            await result;
                        }
                    } catch (error) {
                        console.error(`Error in handler ${handler}:`, error);
                    }
                } else {
                    console.error(`Handler ${handler} not found in configManager`);
                }
            });
            
            boundCount++;
            console.log(`Successfully bound ${event} event to ${id}`);
        } else {
            console.warn(`Button with id '${id}' not found in DOM`);
        }
    });
    
    console.log(`Event binding completed: ${boundCount}/${totalButtons} buttons bound`);
    
    // Special check for reset countdown button
    const resetBtn = document.getElementById('resetCountdownBtn');
    if (resetBtn) {
        console.log('✅ Reset countdown button found and bound');
        // Add a test click event
        resetBtn.addEventListener('click', () => {
            console.log('🎯 Reset countdown button clicked!');
        });
    } else {
        console.error('❌ Reset countdown button NOT found!');
    }
    
    return boundCount;
}

// Configuration Management Class
class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
        this.init();
    }

    // Initialize configuration
    init() {
        this.setupEventListeners();
        this.loadSavedConfig();
        this.updateSystemStatus();
        this.updateLargeTransactionStats();
        this.updateSuccessAddressStats();
        this.updateHoldersSnapshotStats();
        this.updateRewardDataStats();
    }

    // Load configuration
    loadConfig() {
        const saved = localStorage.getItem(ADMIN_CONFIG.storageKey);
        return saved ? JSON.parse(saved) : {
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
                message: 'TO THE MOON!!! 🚀'
            },
            rewardCountdown: {
                minutes: 20,
                seconds: 0,
                lastUpdate: new Date().toISOString()
            },
            system: {
                lastUpdate: new Date().toISOString(),
                uptime: new Date().toISOString()
            }
        };
    }

    // Save configuration
    saveConfig() {
        this.config.system.lastUpdate = new Date().toISOString();
        localStorage.setItem(ADMIN_CONFIG.storageKey, JSON.stringify(this.config));
        this.log('Configuration saved', 'success');
        this.updateSystemStatus();
    }

    // Set up event listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Use multiple safeguards to ensure event listeners are properly bound
        const bindEvents = () => {
            console.log('Binding events...');
            const boundCount = bindEventListenersWithRetry();
            
            if (boundCount === 0) {
                console.warn('No events bound, retrying in 1 second...');
                setTimeout(bindEvents, 1000);
            } else {
                console.log(`Successfully bound ${boundCount} events`);
            }
        };
        
        // Try binding immediately
        bindEvents();
        
        // If DOM is not ready, wait for DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindEvents);
        }
        
        // Additional safeguard: try again after page is fully loaded
        window.addEventListener('load', bindEvents);
        
        // Periodically check and rebind (prevent dynamic content loading issues)
        setInterval(() => {
            const resetBtn = document.getElementById('resetCountdownBtn');
            if (resetBtn && !resetBtn.hasAttribute('data-bound')) {
                console.log('Re-binding events due to dynamic content...');
                bindEvents();
            }
        }, 5000);
    }

    // Bind event listeners - now using global function
    bindEventListeners() {
        // This method is now replaced by the global bindEventListenersWithRetry function
        console.log('bindEventListeners called - using global function instead');
        return bindEventListenersWithRetry();
    }

    // Load saved configuration to interface
    loadSavedConfig() {
        // RPC Configuration
        const rpcUrlInput = document.getElementById('rpcUrl');
        if (rpcUrlInput) {
            rpcUrlInput.value = this.config.rpc.url;
        }

        // Token Configuration
        const tokenAddressInput = document.getElementById('tokenAddress');
        const tokenNameInput = document.getElementById('tokenName');
        if (tokenAddressInput) {
            tokenAddressInput.value = this.config.token.address;
        }
        if (tokenNameInput) {
            tokenNameInput.value = this.config.token.name;
        }

        // Countdown Configuration
        const countdownMinutesInput = document.getElementById('countdownMinutes');
        const countdownMessageInput = document.getElementById('countdownMessage');
        if (countdownMinutesInput) {
            countdownMinutesInput.value = this.config.countdown.minutes;
        }
        if (countdownMessageInput) {
            countdownMessageInput.value = this.config.countdown.message;
        }

        // Holding Countdown Configuration
        const rewardCountdownMinutesInput = document.getElementById('rewardCountdownMinutes');
        const rewardCountdownSecondsInput = document.getElementById('rewardCountdownSeconds');
        if (rewardCountdownMinutesInput) {
            rewardCountdownMinutesInput.value = this.config.rewardCountdown.minutes;
        }
        if (rewardCountdownSecondsInput) {
            rewardCountdownSecondsInput.value = this.config.rewardCountdown.seconds;
        }

        // Check if there's a global countdown running
        this.checkGlobalCountdown();

        this.updateStatusIndicators();
        this.updateDetectionStatus();
    }

    // Start Detection
    async startDetection() {
        // Check RPC and token configuration
        if (!this.config.rpc.url || !this.config.token.address) {
            this.showModal('Error', 'Please configure RPC URL and token address first');
            return;
        }

        if (!this.config.rpc.connected) {
            this.showModal('Error', 'Please test RPC connection first');
            return;
        }

        if (!this.config.token.validated) {
            this.showModal('Error', 'Please validate token address first');
            return;
        }

        this.setLoadingState('startDetectionBtn', true);

        try {
            // Use BackendManager for Firebase sync if available
            if (window.backendManager) {
                window.backendManager.setDetectionControl(true, this.config.rpc.url, this.config.token.address);
                this.log('Detection started with Firebase sync', 'success');
            } else {
                // Fallback to localStorage only
                const detectionConfig = {
                    isRunning: true,
                    rpcUrl: this.config.rpc.url,
                    tokenAddress: this.config.token.address,
                    tokenName: this.config.token.name,
                    startTime: new Date().toISOString(),
                    lastUpdate: new Date().toISOString()
                };
                localStorage.setItem('memeCoinDetection', JSON.stringify(detectionConfig));
                this.log('Detection started (localStorage only)', 'success');
            }

            this.updateDetectionStatus();
        } catch (error) {
            this.log(`Failed to start detection: ${error.message}`, 'error');
        } finally {
            this.setLoadingState('startDetectionBtn', false);
        }
    }

    // Stop Detection
    stopDetection() {
        this.showModal('Confirm Stop', 'Are you sure you want to stop detection?', () => {
            try {
                // Use BackendManager for Firebase sync if available
                if (window.backendManager) {
                    window.backendManager.clearDetectionControl();
                    this.log('Detection stopped with Firebase sync', 'warning');
                } else {
                    // Fallback to localStorage only
                    localStorage.removeItem('memeCoinDetection');
                    this.log('Detection stopped (localStorage only)', 'warning');
                }
                
                this.updateDetectionStatus();
            } catch (error) {
                this.log(`Failed to stop detection: ${error.message}`, 'error');
            }
        });
    }

    // Refresh Detection Status
    refreshDetectionStatus() {
        this.updateDetectionStatus();
        this.log('Detection status refreshed', 'info');
    }

    // Update Detection Status
    updateDetectionStatus() {
        const detectionConfig = localStorage.getItem('memeCoinDetection');
        const startDetectionBtn = document.getElementById('startDetectionBtn');
        const stopDetectionBtn = document.getElementById('stopDetectionBtn');
        const detectionStatusText = document.getElementById('detectionStatusText');
        const detectionStatusDot = document.getElementById('detectionStatusDot');

        if (detectionConfig) {
            try {
                const config = JSON.parse(detectionConfig);
                
                if (config.isRunning) {
                    // Detection is running
                    if (startDetectionBtn) startDetectionBtn.disabled = true;
                    if (stopDetectionBtn) stopDetectionBtn.disabled = false;
                    if (detectionStatusText) detectionStatusText.textContent = 'Running';
                    if (detectionStatusDot) {
                        detectionStatusDot.className = 'status-dot connected';
                    }
                } else {
                    // Detection is stopped
                    if (startDetectionBtn) startDetectionBtn.disabled = false;
                    if (stopDetectionBtn) stopDetectionBtn.disabled = true;
                    if (detectionStatusText) detectionStatusText.textContent = 'Stopped';
                    if (detectionStatusDot) {
                        detectionStatusDot.className = 'status-dot disconnected';
                    }
                }

                // Update status display
                this.updateDetectionStatusDisplay(config);
            } catch (error) {
                console.error('Failed to parse detection config:', error);
            }
        } else {
            // No detection configuration
            if (startDetectionBtn) startDetectionBtn.disabled = false;
            if (stopDetectionBtn) stopDetectionBtn.disabled = true;
            if (detectionStatusText) detectionStatusText.textContent = 'Not Started';
            if (detectionStatusDot) {
                detectionStatusDot.className = 'status-dot disconnected';
            }
            this.updateDetectionStatusDisplay(null);
        }
    }

    // Update detection status display
    updateDetectionStatusDisplay(config) {
        // RPC connection status
        const rpcConnectionStatus = document.getElementById('rpcConnectionStatus');
        const rpcConnectionIcon = document.querySelector('#detectionStatusDisplay .status-item:nth-child(1) i');
        
        if (this.config.rpc.connected) {
            if (rpcConnectionStatus) rpcConnectionStatus.textContent = 'Connected';
            if (rpcConnectionIcon) rpcConnectionIcon.className = 'fa fa-circle connected';
        } else {
            if (rpcConnectionStatus) rpcConnectionStatus.textContent = 'Not Connected';
            if (rpcConnectionIcon) rpcConnectionIcon.className = 'fa fa-circle disconnected';
        }

        // Token address status
        const tokenAddressStatus = document.getElementById('tokenAddressStatus');
        const tokenAddressIcon = document.querySelector('#detectionStatusDisplay .status-item:nth-child(2) i');
        
        if (this.config.token.validated) {
            if (tokenAddressStatus) tokenAddressStatus.textContent = 'Set';
            if (tokenAddressIcon) tokenAddressIcon.className = 'fa fa-circle connected';
        } else {
            if (tokenAddressStatus) tokenAddressStatus.textContent = 'Not Set';
            if (tokenAddressIcon) tokenAddressIcon.className = 'fa fa-circle disconnected';
        }

        // Detection running status
        const detectionRunningStatus = document.getElementById('detectionRunningStatus');
        const detectionRunningIcon = document.querySelector('#detectionStatusDisplay .status-item:nth-child(3) i');
        
        if (config && config.isRunning) {
            if (detectionRunningStatus) detectionRunningStatus.textContent = 'Running';
            if (detectionRunningIcon) detectionRunningIcon.className = 'fa fa-circle connected';
        } else {
            if (detectionRunningStatus) detectionRunningStatus.textContent = 'Not Started';
            if (detectionRunningIcon) detectionRunningIcon.className = 'fa fa-circle disconnected';
        }

        // Update statistics
        this.updateDetectionStats(config);
    }

    // Update detection statistics
    updateDetectionStats(config) {
        const statsDisplay = document.getElementById('detectionStats');
        if (!statsDisplay) return;

        // Get frontend and backend transaction data
        const frontendData = localStorage.getItem('memeCoinTransactions');
        const backendData = localStorage.getItem('memeCoinBackendTransactions');
        
        let frontendTransactions = [];
        let backendTransactions = [];
        
        try {
            if (frontendData) {
                const parsed = JSON.parse(frontendData);
                frontendTransactions = parsed.transactions || [];
            }
            if (backendData) {
                const parsed = JSON.parse(backendData);
                backendTransactions = parsed.transactions || [];
            }
        } catch (error) {
            console.error('Failed to parse transaction data:', error);
        }

        const totalCount = backendTransactions.length;
        const lastUpdate = config?.lastUpdate ? new Date(config.lastUpdate).toLocaleString() : 'Unknown';
        const lastUpload = backendData ? (() => {
            try {
                const parsed = JSON.parse(backendData);
                return parsed.lastUpload ? new Date(parsed.lastUpload).toLocaleString() : 'Unknown';
            } catch {
                return 'Unknown';
            }
        })() : 'Unknown';

        statsDisplay.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Frontend Records:</span>
                <span class="stat-value">${frontendTransactions.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Backend Records:</span>
                <span class="stat-value">${backendTransactions.length}/100</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Last Update:</span>
                <span class="stat-value">${lastUpdate}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Last Upload:</span>
                <span class="stat-value">${lastUpload}</span>
            </div>
        `;
    }

    // Check global countdown status
    checkGlobalCountdown() {
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // Countdown is still running
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    // Update interface to show remaining time
                    const countdownMinutesInput = document.getElementById('countdownMinutes');
                    if (countdownMinutesInput) {
                        countdownMinutesInput.value = remainingMinutes;
                    }
                    
                    // Update backend configuration to maintain synchronization
                    this.config.countdown.minutes = remainingMinutes;
                    this.config.countdown.seconds = remainingSeconds;
                    this.config.countdown.lastUpdate = data.lastUpdate;
                    
                    this.log(`Global countdown detected running, remaining ${remainingMinutes}m ${remainingSeconds}s`, 'info');
                } else {
                    // Countdown has ended
                    this.log('Global countdown has ended', 'warning');
                }
            } catch (error) {
                console.error('Failed to check global countdown:', error);
            }
        }
    }

    // Test RPC connection
    async testRpcConnection() {
        const rpcUrl = document.getElementById('rpcUrl').value.trim();
        if (!rpcUrl) {
            this.showModal('Error', 'Please enter RPC URL');
            return;
        }

        this.setLoadingState('testRpcBtn', true);
        this.updateRpcStatus('connecting', 'Connecting...');

        try {
            // Simulate RPC connection test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Here should actually test RPC connection
            const isValid = rpcUrl.includes('quiknode.pro');
            
            if (isValid) {
                this.config.rpc.connected = true;
                this.config.rpc.lastTest = new Date().toISOString();
                this.updateRpcStatus('connected', 'Connected');
                this.log('RPC connection test successful', 'success');
            } else {
                throw new Error('Invalid RPC URL');
            }
        } catch (error) {
            this.config.rpc.connected = false;
            this.updateRpcStatus('disconnected', 'Connection Failed');
            this.log(`RPC connection test failed: ${error.message}`, 'error');
        } finally {
            this.setLoadingState('testRpcBtn', false);
        }
    }

    // Save RPC configuration
    saveRpcConfig() {
        const rpcUrl = document.getElementById('rpcUrl').value.trim();
        if (!rpcUrl) {
            this.showModal('Error', 'Please enter RPC URL');
            return;
        }

        this.config.rpc.url = rpcUrl;
        this.saveConfig();
        this.log('RPC configuration saved', 'success');
    }

    // Validate token address
    async validateTokenAddress() {
        const tokenAddress = document.getElementById('tokenAddress').value.trim();
        if (!tokenAddress) {
            this.showModal('Error', 'Please enter token address');
            return;
        }

        this.setLoadingState('validateTokenBtn', true);
        this.updateTokenStatus('validating', 'Validating...');

        try {
            // Simulate token address validation
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Here should actually validate Solana token address
            const isValid = tokenAddress.length === 44 && /^[A-Za-z0-9]+$/.test(tokenAddress);
            
            if (isValid) {
                this.config.token.validated = true;
                this.updateTokenStatus('validated', 'Validated');
                this.log('Token address validation successful', 'success');
            } else {
                throw new Error('Invalid token address format');
            }
        } catch (error) {
            this.config.token.validated = false;
            this.updateTokenStatus('invalid', 'Validation Failed');
            this.log(`Token address validation failed: ${error.message}`, 'error');
        } finally {
            this.setLoadingState('validateTokenBtn', false);
        }
    }

    // Save token configuration
    saveTokenConfig() {
        const tokenAddress = document.getElementById('tokenAddress').value.trim();
        const tokenName = document.getElementById('tokenName').value.trim();
        
        if (!tokenAddress) {
            this.showModal('Error', 'Please enter token address');
            return;
        }

        this.config.token.address = tokenAddress;
        this.config.token.name = tokenName;
        this.saveConfig();
        this.log('Token configuration saved', 'success');
    }

    // Reset countdown
    resetCountdown() {
        console.log('Reset countdown method called');
        
        try {
            // Check if DOM elements exist
            const countdownMinutesInput = document.getElementById('countdownMinutes');
            if (!countdownMinutesInput) {
                console.error('countdownMinutes input not found');
                this.log('Error: Countdown minutes input not found', 'error');
                return;
            }

            this.showModal('Confirm Reset', 'Are you sure you want to reset the countdown? This will restart the global countdown and all online users will be synchronized.', () => {
                try {
                    console.log('Reset countdown confirmed');
                    
                    // Create new countdown time
                    const minutes = parseInt(countdownMinutesInput.value) || 5;
                    
                    // Use Firebase real-time sync (if available)
                    if (window.globalCountdownManager) {
                        this.log('Using Firebase real-time sync to reset countdown...', 'info');
                        window.globalCountdownManager.resetCountdown(minutes).then((success) => {
                            if (success) {
                                this.log(`Countdown reset to ${minutes} minutes, all users synchronized`, 'success');
                            } else {
                                this.log('Firebase sync failed, using local storage', 'warning');
                                this.resetCountdownLocal(minutes);
                            }
                        });
                    } else {
                        // Fallback to local storage
                        this.log('Firebase not available, using local storage', 'info');
                        this.resetCountdownLocal(minutes).then(() => {
                            this.log('Local reset completed', 'success');
                        }).catch((error) => {
                            this.log('Local reset failed: ' + error.message, 'error');
                        });
                    }
                    
                } catch (error) {
                    console.error('Error in reset countdown callback:', error);
                    this.log(`Error occurred while resetting countdown: ${error.message}`, 'error');
                }
            });
        } catch (error) {
            console.error('Error in resetCountdown method:', error);
            this.log(`Reset countdown method error: ${error.message}`, 'error');
        }
    }

    // Local storage reset countdown (fallback solution)
    async resetCountdownLocal(minutes) {
        try {
            const now = new Date();
            const newTargetDate = new Date(now.getTime() + minutes * 60 * 1000);
            
            console.log('New countdown data:', {
                minutes: minutes,
                targetDate: newTargetDate.toISOString(),
                currentTime: now.toISOString()
            });
            
            // Save to global countdown storage
            const countdownData = {
                targetDate: newTargetDate.toISOString(),
                lastUpdate: new Date().toISOString(),
                resetBy: 'admin-panel',
                version: '2.0'
            };
            
            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinCountdown', countdownData);
                this.log(`Countdown reset to ${minutes} minutes with Firebase sync`, 'success');
            } else {
                // Fallback to direct Firebase or localStorage
                if (typeof firebase !== 'undefined' && firebase.database) {
                    try {
                        const countdownRef = firebase.database().ref('countdown');
                        await countdownRef.set(countdownData);
                        console.log('Countdown data saved to Firebase');
                        this.log(`Countdown reset to ${minutes} minutes (Firebase sync)`, 'success');
                    } catch (firebaseError) {
                        console.error('Failed to save to Firebase:', firebaseError);
                        this.log('Firebase save failed, using localStorage', 'warning');
                        
                        // Fallback to localStorage
                        try {
                            localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
                            console.log('Countdown data saved to localStorage');
                        } catch (storageError) {
                            console.error('Failed to save to localStorage:', storageError);
                            this.log('Warning: Unable to save to localStorage, but countdown will still reset', 'warning');
                        }
                    }
                } else {
                    // Use localStorage directly
                    try {
                        localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
                        console.log('Countdown data saved to localStorage');
                        this.log(`Countdown reset to ${minutes} minutes (localStorage only)`, 'success');
                    } catch (storageError) {
                        console.error('Failed to save to localStorage:', storageError);
                        this.log('Warning: Unable to save to localStorage, but countdown will still reset', 'warning');
                    }
                }
            }
            
            // Update backend configuration
            this.config.countdown.minutes = minutes;
            this.config.countdown.lastUpdate = new Date().toISOString();
            this.saveConfig();
            
            // Verify save was successful
            const savedData = localStorage.getItem('memeCoinCountdown');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                console.log('Verified saved data:', parsed);
            }
            
            // Trigger custom event to notify frontend page
            window.dispatchEvent(new CustomEvent('countdownReset', {
                detail: countdownData
            }));
            
        } catch (error) {
            console.error('Error in resetCountdownLocal:', error);
            this.log(`Error occurred while resetting countdown locally: ${error.message}`, 'error');
        }
    }

    // Save countdown configuration
    async saveCountdownConfig() {
        const minutes = parseInt(document.getElementById('countdownMinutes').value);
        const message = document.getElementById('countdownMessage').value.trim();
        
        if (minutes < 1 || minutes > 1440) {
            this.showModal('Error', 'Countdown minutes must be between 1-1440');
            return;
        }

        this.config.countdown.minutes = minutes;
        this.config.countdown.message = message;
        this.config.countdown.lastUpdate = new Date().toISOString();
        this.saveConfig();
        
        // If there's currently a countdown running, update it
        const currentCountdown = localStorage.getItem('memeCoinCountdown');
        if (currentCountdown) {
            try {
                const data = JSON.parse(currentCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                // If countdown hasn't ended, update remaining time
                if (targetDate > now) {
                    const remainingTime = targetDate - now;
                    const newTargetDate = new Date(now.getTime() + remainingTime);
                    
                    const countdownData = {
                        targetDate: newTargetDate.toISOString(),
                        lastUpdate: new Date().toISOString(),
                        message: message,
                        version: '2.0'
                    };
                    
                    // Use BackendManager for sync if available
                    if (window.backendManager) {
                        window.backendManager.setLocalStorageWithSync('memeCoinCountdown', countdownData);
                        console.log('Countdown config updated via BackendManager');
                    } else {
                        // Fallback to direct Firebase or localStorage
                        if (typeof firebase !== 'undefined' && firebase.database) {
                            try {
                                const countdownRef = firebase.database().ref('countdown');
                                await countdownRef.set(countdownData);
                                console.log('Countdown config updated via Firebase');
                            } catch (firebaseError) {
                                console.error('Failed to update via Firebase:', firebaseError);
                                localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
                            }
                        } else {
                            localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to update countdown:', error);
            }
        }
        
        this.log('Countdown configuration saved', 'success');
    }

    // Reset holding countdown
    resetRewardCountdown() {
        const minutes = parseInt(document.getElementById('rewardCountdownMinutes').value);
        
        if (minutes < 1 || minutes > 1440) {
            this.showModal('Error', 'Holding countdown minutes must be between 1-1440');
            return;
        }

        this.showModal('Confirm Reset', `Are you sure you want to reset the holding countdown to ${minutes} minutes?`, () => {
            // Set global holding countdown storage with Firebase sync
            const now = new Date();
            const targetDate = new Date(now.getTime() + (minutes * 60) * 1000);
            
            const rewardCountdownData = {
                targetDate: targetDate.toISOString(),
                lastUpdate: new Date().toISOString(),
                resetBy: 'admin-panel'
            };
            
            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinRewardCountdown', rewardCountdownData);
                this.log(`Holding countdown reset to ${minutes} minutes with Firebase sync`, 'success');
            } else {
                localStorage.setItem('memeCoinRewardCountdown', JSON.stringify(rewardCountdownData));
                this.log(`Holding countdown reset to ${minutes} minutes (localStorage only)`, 'success');
            }
            
            // Also update backend configuration (backup)
            this.config.rewardCountdown.minutes = minutes;
            this.config.rewardCountdown.seconds = 0;
            this.config.rewardCountdown.lastUpdate = new Date().toISOString();
            this.saveConfig();
        });
    }

    // Save holding countdown configuration
    saveRewardCountdownConfig() {
        const minutes = parseInt(document.getElementById('rewardCountdownMinutes').value);
        const seconds = parseInt(document.getElementById('rewardCountdownSeconds').value);
        
        if (minutes < 1 || minutes > 1440) {
            this.showModal('Error', 'Holding countdown minutes must be between 1-1440');
            return;
        }

        if (seconds < 0 || seconds > 59) {
            this.showModal('Error', 'Holding countdown seconds must be between 0-59');
            return;
        }

        // Set global holding countdown storage with Firebase sync
        const now = new Date();
        const targetDate = new Date(now.getTime() + (minutes * 60 + seconds) * 1000);
        
        const rewardCountdownData = {
            targetDate: targetDate.toISOString(),
            lastUpdate: new Date().toISOString(),
            resetBy: 'admin-panel'
        };
        
        // Use BackendManager for sync if available
        if (window.backendManager) {
            window.backendManager.setLocalStorageWithSync('memeCoinRewardCountdown', rewardCountdownData);
            this.log('Holding countdown configuration saved with Firebase sync', 'success');
        } else {
            localStorage.setItem('memeCoinRewardCountdown', JSON.stringify(rewardCountdownData));
            this.log('Holding countdown configuration saved (localStorage only)', 'success');
        }
        
        // Also update backend configuration (backup)
        this.config.rewardCountdown.minutes = minutes;
        this.config.rewardCountdown.seconds = seconds;
        this.config.rewardCountdown.lastUpdate = new Date().toISOString();
        this.saveConfig();
    }

    // Validate reward address
    async validateRewardAddress() {
        const address = document.getElementById('rewardAddress').value.trim();
        
        if (!address) {
            this.showModal('Error', 'Please enter a reward address');
            return;
        }

        // Use BackendManager to validate the address
        if (window.backendManager) {
            const isValid = window.backendManager.validateSolanaAddress(address);
            if (isValid) {
                this.showModal('Success', 'Address format is valid');
                this.log(`Reward address validated: ${address}`, 'success');
            } else {
                this.showModal('Error', 'Invalid Solana address format');
                this.log(`Invalid reward address format: ${address}`, 'error');
            }
        } else {
            // Fallback validation
            const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
            if (!solanaAddressRegex.test(address)) {
                this.showModal('Error', 'Invalid Solana address format');
                return;
            }

            this.showModal('Success', 'Address format is valid');
            this.log(`Reward address validated: ${address}`, 'success');
        }
    }

    // Clear reward address
    async clearRewardAddress() {
        this.showModal('Confirm Clear', 'Are you sure you want to clear the reward address? This will remove the current reward configuration.', async () => {
            try {
                // Use BackendManager to clear the reward address
                if (window.backendManager) {
                    const success = window.backendManager.clearMainCountdownRewardAddress();
                    if (success) {
                        // Clear form fields
                        document.getElementById('rewardAddress').value = '';
                        document.getElementById('rewardAmount').value = '100000';
                        document.getElementById('rewardDescription').value = 'Main Countdown Winner Reward';

                        // Update status
                        this.updateRewardAddressStatus('Not Set', 'not-set');
                        this.updateRewardAddressDisplay();

                        this.showModal('Success', 'Reward address cleared successfully');
                        this.log('Reward address cleared', 'warning');
                    } else {
                        throw new Error('Failed to clear reward address');
                    }
                } else {
                    throw new Error('BackendManager not available');
                }
            } catch (error) {
                console.error('Error clearing reward address:', error);
                this.showModal('Error', 'Failed to clear reward address: ' + error.message);
            }
        });
    }

    // Save reward address configuration
    async saveRewardAddressConfig() {
        const address = document.getElementById('rewardAddress').value.trim();
        const amount = parseInt(document.getElementById('rewardAmount').value) || 100000;
        const description = document.getElementById('rewardDescription').value.trim() || 'Main Countdown Winner Reward';

        if (!address) {
            this.showModal('Error', 'Please enter a reward address');
            return;
        }

        // Basic Solana address validation
        const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        if (!solanaAddressRegex.test(address)) {
            this.showModal('Error', 'Invalid Solana address format');
            return;
        }

        try {
            // Use BackendManager to set the reward address
            if (window.backendManager) {
                const success = window.backendManager.setMainCountdownRewardAddress(address);
                if (success) {
                    // Create the actual reward for the address
                    const rewardData = window.backendManager.createMainCountdownRewardForAddress(address);
                    
                    if (rewardData) {
                        // Update status
                        this.updateRewardAddressStatus('Set', 'success');
                        this.updateRewardAddressDisplay();

                        this.showModal('Success', `Reward address saved successfully. Address: ${address}, Amount: ${amount.toLocaleString()} points`);
                        this.log(`Reward address configured: ${address} (${amount.toLocaleString()} points)`, 'success');
                    } else {
                        throw new Error('Failed to create reward data');
                    }
                } else {
                    throw new Error('Failed to save reward address');
                }
            } else {
                throw new Error('BackendManager not available');
            }

        } catch (error) {
            console.error('Error saving reward address:', error);
            this.showModal('Error', 'Failed to save reward address: ' + error.message);
            this.log('Error saving reward address: ' + error.message, 'error');
        }
    }

    // Update reward address status
    updateRewardAddressStatus(status, type) {
        const statusDot = document.getElementById('rewardAddressStatusDot');
        const statusText = document.getElementById('rewardAddressStatusText');
        
        if (statusDot && statusText) {
            statusDot.className = `status-dot ${type}`;
            statusText.textContent = status;
        }
    }

    // Update reward address display
    updateRewardAddressDisplay() {
        // Get data from BackendManager
        if (window.backendManager) {
            const rewardData = window.backendManager.getMainCountdownRewardAddress();
            if (rewardData && rewardData.address) {
                document.getElementById('currentRewardAddress').textContent = rewardData.address;
                document.getElementById('currentRewardAmount').textContent = (rewardData.amount || 100000).toLocaleString();
                
                // Update form fields
                document.getElementById('rewardAddress').value = rewardData.address;
                document.getElementById('rewardAmount').value = rewardData.amount || 100000;
                
                // Check if reward is claimed
                this.checkRewardClaimStatus();
            } else {
                document.getElementById('currentRewardAddress').textContent = 'Not Set';
                document.getElementById('currentRewardAmount').textContent = '0';
            }
        } else {
            // Fallback to form values
            const address = document.getElementById('rewardAddress').value.trim();
            const amount = parseInt(document.getElementById('rewardAmount').value) || 0;
            
            document.getElementById('currentRewardAddress').textContent = address || 'Not Set';
            document.getElementById('currentRewardAmount').textContent = amount.toLocaleString();
            
            // Check if reward is claimed
            this.checkRewardClaimStatus();
        }
    }

    // Check reward claim status
    async checkRewardClaimStatus() {
        try {
            // Get address from BackendManager
            let address = '';
            if (window.backendManager) {
                const rewardData = window.backendManager.getMainCountdownRewardAddress();
                address = rewardData ? rewardData.address : '';
            }
            
            if (!address) {
                document.getElementById('rewardClaimStatus').textContent = 'Not Set';
                return;
            }

            // Check local storage for rewards
            const mainCountdownRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const addressRewards = mainCountdownRewards.filter(reward => reward.winner === address);
            
            if (addressRewards.length > 0) {
                const unclaimedRewards = addressRewards.filter(reward => !reward.claimed);
                
                if (unclaimedRewards.length > 0) {
                    document.getElementById('rewardClaimStatus').textContent = 'Available to Claim';
                } else {
                    document.getElementById('rewardClaimStatus').textContent = 'Already Claimed';
                }
            } else {
                document.getElementById('rewardClaimStatus').textContent = 'Not Available';
            }
        } catch (error) {
            console.error('Error checking reward claim status:', error);
            document.getElementById('rewardClaimStatus').textContent = 'Error';
        }
    }

    // Save all configurations
    async saveAllConfig() {
        try {
            this.saveRpcConfig();
            this.saveTokenConfig();
            await this.saveCountdownConfig();
            this.saveRewardCountdownConfig();
            await this.saveRewardAddressConfig();
            this.showModal('Success', 'All configurations saved');
        } catch (error) {
            console.error('Error occurred while saving configuration:', error);
            this.log('Error occurred while saving configuration: ' + error.message, 'error');
            this.showModal('Error', 'Error occurred while saving configuration: ' + error.message);
        }
    }

    // Refresh status
    refreshStatus() {
        this.updateSystemStatus();
        this.log('System status refreshed', 'info');
    }

    // Clear cache
    clearCache() {
        this.showModal('Confirm Clear', 'Are you sure you want to clear all cache? This will clear all locally stored data.', () => {
            localStorage.clear();
            this.log('Cache cleared', 'warning');
            this.config = this.loadConfig();
            this.loadSavedConfig();
        });
    }

    // Export configuration
    exportConfig() {
        const configData = {
            ...this.config,
            exportTime: new Date().toISOString(),
            version: ADMIN_CONFIG.version
        };
        
        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meme-coin-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.log('Configuration exported', 'success');
    }

    // Clear log
    clearLog() {
        const logContent = document.getElementById('systemLog');
        if (logContent) {
            logContent.innerHTML = '<div class="log-entry info"><span class="log-time">[System]</span><span class="log-message">Log cleared</span></div>';
        }
    }

    // Export log
    exportLog() {
        const logContent = document.getElementById('systemLog');
        if (logContent) {
            const logText = logContent.innerText;
            const blob = new Blob([logText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meme-coin-log-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    // View transaction records
    viewTransactions() {
        const backendData = localStorage.getItem('memeCoinBackendTransactions');
        if (!backendData) {
            this.showModal('Notice', 'No transaction records to view');
            return;
        }

        try {
            const data = JSON.parse(backendData);
            const transactions = data.transactions || [];
            
            if (transactions.length === 0) {
                this.showModal('Notice', 'No transaction records');
                return;
            }

            // Create transaction record display window
            this.showTransactionModal(transactions);
            
        } catch (error) {
            console.error('Failed to parse transaction records:', error);
            this.showModal('Error', 'Failed to parse transaction records');
        }
    }

    // Show transaction record modal
    showTransactionModal(transactions) {
        const modal = document.getElementById('transactionModal');
        const modalContent = document.getElementById('transactionModalContent');
        
        if (!modal || !modalContent) {
            this.showModal('Error', 'Transaction record display component not found');
            return;
        }

        // Generate transaction record table
        const tableHTML = this.generateTransactionTable(transactions);
        modalContent.innerHTML = tableHTML;
        
        // Show modal
        modal.style.display = 'flex';
        
        // Add close event
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }
    }

    // Generate transaction record table
    generateTransactionTable(transactions) {
        const tableRows = transactions.map((tx, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${tx.signature.substring(0, 8)}...</td>
                <td>${tx.trader}</td>
                <td>${tx.amount}</td>
                <td>${tx.type}</td>
                <td>${tx.status === 'success' ? '✅' : '❌'}</td>
                <td>${tx.timestamp}</td>
            </tr>
        `).join('');

        return `
            <div class="modal-header">
                <h3>Transaction Records (Total: ${transactions.length})</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Signature</th>
                            <th>Trader</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Clear transaction records
    clearTransactions() {
        this.showModal('Confirm', 'Are you sure you want to clear all transaction records? This action cannot be undone.', () => {
            try {
                localStorage.removeItem('memeCoinBackendTransactions');
                localStorage.removeItem('memeCoinTransactions');
                this.log('Transaction records cleared', 'warning');
                this.refreshDetectionStatus();
                this.showModal('Success', 'Transaction records cleared');
            } catch (error) {
                console.error('Failed to clear transaction records:', error);
                this.showModal('Error', 'Failed to clear transaction records');
            }
        });
    }

    // Export transaction records
    exportTransactions() {
        const backendData = localStorage.getItem('memeCoinBackendTransactions');
        if (!backendData) {
            this.showModal('Notice', 'No transaction records to export');
            return;
        }

        try {
            const data = JSON.parse(backendData);
            const transactions = data.transactions || [];
            
            if (transactions.length === 0) {
                this.showModal('Notice', 'No transaction records');
                return;
            }

            // Generate CSV format
            const csvContent = this.generateTransactionCSV(transactions);
            const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
            
            this.downloadFile(filename, csvContent);
            this.log('Transaction records exported', 'success');
            
        } catch (error) {
            console.error('Failed to export transaction records:', error);
            this.showModal('Error', 'Failed to export transaction records');
        }
    }

    // Generate transaction record CSV
    generateTransactionCSV(transactions) {
        const headers = ['No.', 'Signature', 'Trader', 'Amount', 'Type', 'Status', 'Time', 'Processed Time'];
        const rows = transactions.map((tx, index) => [
            index + 1,
            tx.signature,
            tx.trader,
            tx.amount,
            tx.type,
            tx.status,
            tx.timestamp,
            tx.processedAt ? new Date(tx.processedAt).toLocaleString() : 'Unknown'
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return '\ufeff' + csvContent; // Add BOM for UTF-8 support
    }

    // Download file
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Update status indicators
    updateStatusIndicators() {
        // RPC status
        if (this.config.rpc.connected) {
            this.updateRpcStatus('connected', 'Connected');
        } else {
            this.updateRpcStatus('disconnected', 'Not Connected');
        }

        // Token status
        if (this.config.token.validated) {
            this.updateTokenStatus('validated', 'Validated');
        } else {
            this.updateTokenStatus('invalid', 'Not Validated');
        }

        // Countdown status
        this.updateCountdownStatus('running', 'Running');
        
        // Update other status indicators
        this.updateHoldersSnapshotStats();
        this.updateLargeTransactionStats();
        this.updateSuccessAddressStats();
        this.updateRewardDataStats();
        
        // Update reward address status
        this.updateRewardAddressDisplay();
    }

    // Update RPC status
    updateRpcStatus(status, text) {
        const statusDot = document.getElementById('rpcStatusDot');
        const statusText = document.getElementById('rpcStatusText');
        
        if (statusDot) {
            statusDot.className = 'status-dot';
            if (status === 'connected') statusDot.classList.add('connected');
            else if (status === 'connecting') statusDot.classList.add('warning');
            else statusDot.classList.add('disconnected');
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }

    // Update token status
    updateTokenStatus(status, text) {
        const statusDot = document.getElementById('tokenStatusDot');
        const statusText = document.getElementById('tokenStatusText');
        
        if (statusDot) {
            statusDot.className = 'status-dot';
            if (status === 'validated') statusDot.classList.add('connected');
            else if (status === 'validating') statusDot.classList.add('warning');
            else statusDot.classList.add('disconnected');
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }

    // Update countdown status
    updateCountdownStatus(status, text) {
        const statusDot = document.getElementById('countdownStatusDot');
        const statusText = document.getElementById('countdownStatusText');
        
        if (statusDot) {
            statusDot.className = 'status-dot';
            if (status === 'running') statusDot.classList.add('connected');
            else statusDot.classList.add('warning');
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }

    // Update holding countdown status
    updateRewardCountdownStatus() {
        const statusDot = document.getElementById('rewardCountdownStatusDot');
        const statusText = document.getElementById('rewardCountdownStatusText');
        const remainingTime = document.getElementById('rewardCountdownRemaining');
        const lastUpdate = document.getElementById('rewardCountdownLastUpdate');
        
        if (statusDot) {
            statusDot.className = 'status-dot connected';
        }
        
        if (statusText) {
            statusText.textContent = 'Running';
        }
        
        if (remainingTime) {
            const minutes = this.config.rewardCountdown.minutes;
            const seconds = this.config.rewardCountdown.seconds;
            remainingTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (lastUpdate) {
            const updateTime = new Date(this.config.rewardCountdown.lastUpdate);
            lastUpdate.textContent = updateTime.toLocaleString();
        }
    }

    // Update system status
    updateSystemStatus() {
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        const uptime = document.getElementById('uptime');
        const footerUpdateTime = document.getElementById('footerUpdateTime');
        
        if (lastUpdateTime) {
            lastUpdateTime.textContent = new Date(this.config.system.lastUpdate).toLocaleString();
        }
        
        if (uptime) {
            const startTime = new Date(this.config.system.uptime);
            const now = new Date();
            const diff = now - startTime;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            uptime.textContent = `${hours}h ${minutes}m`;
        }
        
        if (footerUpdateTime) {
            footerUpdateTime.textContent = new Date().toLocaleString();
        }

        // Update countdown status
        this.updateCountdownStatus();
        
        // Update holding countdown status
        this.updateRewardCountdownStatus();
    }

    // Update countdown status
    updateCountdownStatus() {
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        const countdownStatusText = document.getElementById('countdownStatusText');
        const countdownStatusDot = document.getElementById('countdownStatusDot');
        
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // Countdown is still running
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    if (countdownStatusText) {
                        countdownStatusText.textContent = `Running (${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')})`;
                    }
                    
                    if (countdownStatusDot) {
                        countdownStatusDot.className = 'status-dot connected';
                    }
                    
                    // Update configuration display
                    const countdownMinutesInput = document.getElementById('countdownMinutes');
                    if (countdownMinutesInput) {
                        countdownMinutesInput.value = remainingMinutes;
                    }
                } else {
                    // Countdown has ended
                    if (countdownStatusText) {
                        countdownStatusText.textContent = 'Ended';
                    }
                    
                    if (countdownStatusDot) {
                        countdownStatusDot.className = 'status-dot warning';
                    }
                }
            } catch (error) {
                if (countdownStatusText) {
                    countdownStatusText.textContent = 'Running';
                }
            }
        } else {
            if (countdownStatusText) {
                countdownStatusText.textContent = 'Not Started';
            }
        }
    }

    // Set loading state
    setLoadingState(buttonId, loading) {
        const button = document.getElementById(buttonId);
        if (button) {
            if (loading) {
                button.disabled = true;
                button.classList.add('loading');
            } else {
                button.disabled = false;
                button.classList.remove('loading');
            }
        }
    }

    // Show modal
    showModal(title, message, onConfirm = null) {
        const modal = document.getElementById('configModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalConfirm = document.getElementById('modalConfirm');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.textContent = message;
            modal.classList.add('show');
            
            if (onConfirm) {
                modalConfirm.onclick = () => {
                    onConfirm();
                    this.closeModal();
                };
            } else {
                modalConfirm.onclick = () => this.closeModal();
            }
        }
    }

    // Close modal
    closeModal() {
        // Close configuration modal
        const configModal = document.getElementById('configModal');
        if (configModal) {
            configModal.classList.remove('show');
        }
        
        // Close general modal
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Close transaction modal
        const transactionModal = document.getElementById('transactionModal');
        if (transactionModal) {
            transactionModal.classList.remove('show');
        }
    }

    // Add log
    log(message, type = 'info') {
        const logContent = document.getElementById('systemLog');
        if (!logContent) return;

        const time = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-message">${message}</span>
        `;

        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;

        // Limit log entries count
        const entries = logContent.querySelectorAll('.log-entry');
        if (entries.length > ADMIN_CONFIG.logMaxEntries) {
            entries[0].remove();
        }
    }

    // Large transaction notification management methods
    viewLargeTransactions() {
        try {
            const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            const notificationList = notifications ? JSON.parse(notifications) : [];
            
            if (notificationList.length === 0) {
                this.showModal('Large Transaction Notifications', 'No large transaction notification records');
                return;
            }
            
            this.showLargeTransactionModal(notificationList);
        } catch (error) {
            console.error('Failed to view large transactions:', error);
            this.log('Failed to view large transaction notifications', 'error');
        }
    }

    showLargeTransactionModal(notifications) {
        const modal = document.getElementById('transactionModal');
        const modalContent = document.getElementById('transactionModalContent');
        
        if (modal && modalContent) {
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h3 class="modal-title">Large Transaction Notification Records (${notifications.length})</h3>
                    <button class="modal-close" id="modalClose">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.generateLargeTransactionTable(notifications)}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modalCancel">Close</button>
                </div>
            `;
            
            modal.classList.add('show');
            
            // Re-bind event listeners
            document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
            document.getElementById('modalCancel')?.addEventListener('click', () => this.closeModal());
        }
    }

    generateLargeTransactionTable(notifications) {
        if (notifications.length === 0) {
            return '<p>No large transaction notification records</p>';
        }
        
        const tableRows = notifications.map(notification => `
            <tr>
                <td>${new Date(notification.timestamp).toLocaleString()}</td>
                <td><span class="notification-type">${notification.transaction.type}</span></td>
                <td class="notification-amount">${notification.transaction.amount}</td>
                <td class="notification-trader">${notification.transaction.trader}</td>
                <td>${notification.transaction.signature.slice(0, 8)}...</td>
            </tr>
        `).join('');
        
        return `
            <div class="table-container">
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Trader</th>
                            <th>Signature</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    clearLargeTransactions() {
        this.showModal(
            'Clear Large Transaction Notifications',
            'Are you sure you want to clear all large transaction notification records? This action cannot be undone.',
            () => {
                try {
                    localStorage.removeItem('memeCoinLargeTransactionNotifications');
                    this.updateLargeTransactionStats();
                    this.log('Large transaction notification records cleared', 'success');
                } catch (error) {
                    console.error('Failed to clear large transactions:', error);
                    this.log('Failed to clear large transaction notifications', 'error');
                }
            }
        );
    }

    exportLargeTransactions() {
        try {
            const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            const notificationList = notifications ? JSON.parse(notifications) : [];
            
            if (notificationList.length === 0) {
                this.showModal('Export Large Transaction Notifications', 'No large transaction notification records to export');
                return;
            }
            
            const csvContent = this.generateLargeTransactionCSV(notificationList);
            const filename = `large_transactions_${new Date().toISOString().split('T')[0]}.csv`;
            
            this.downloadFile(filename, csvContent);
            this.log(`Large transaction notification records exported: ${filename}`, 'success');
        } catch (error) {
            console.error('Failed to export large transactions:', error);
            this.log('Failed to export large transaction notifications', 'error');
        }
    }

    generateLargeTransactionCSV(notifications) {
        const headers = ['Time', 'Type', 'Amount', 'Trader', 'Signature', 'Message'];
        const rows = notifications.map(notification => [
            new Date(notification.timestamp).toLocaleString(),
            notification.transaction.type,
            notification.transaction.amount,
            notification.transaction.trader,
            notification.transaction.signature,
            notification.message
        ]);
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    updateLargeTransactionStats() {
        try {
            const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            const notificationList = notifications ? JSON.parse(notifications) : [];
            
            // Calculate today's notification count
            const today = new Date().toDateString();
            const todayNotifications = notificationList.filter(notification => 
                new Date(notification.timestamp).toDateString() === today
            ).length;
            
            // Update statistics display
            const todayElement = document.getElementById('todayNotifications');
            const totalElement = document.getElementById('totalNotifications');
            const lastTimeElement = document.getElementById('lastNotificationTime');
            const increasesElement = document.getElementById('countdownIncreases');
            
            if (todayElement) todayElement.textContent = todayNotifications;
            if (totalElement) totalElement.textContent = notificationList.length;
            
            if (lastTimeElement) {
                if (notificationList.length > 0) {
                    const lastNotification = notificationList[0];
                    lastTimeElement.textContent = new Date(lastNotification.timestamp).toLocaleString();
                } else {
                    lastTimeElement.textContent = 'None';
                }
            }
            
            if (increasesElement) {
                increasesElement.textContent = `${notificationList.length} times`;
            }
            
            // Update recent notifications display
            this.updateRecentLargeTransactions(notificationList.slice(0, 5));
            
        } catch (error) {
            console.error('Failed to update large transaction stats:', error);
        }
    }

    updateRecentLargeTransactions(recentNotifications) {
        const container = document.getElementById('recentLargeTransactions');
        if (!container) return;
        
        if (recentNotifications.length === 0) {
            container.innerHTML = '<div class="no-notifications">No large transaction records</div>';
            return;
        }
        
        const notificationItems = recentNotifications.map(notification => `
            <div class="notification-item">
                <div class="notification-header">
                    <span class="notification-time">${new Date(notification.timestamp).toLocaleTimeString()}</span>
                    <span class="notification-type">${notification.transaction.type}</span>
                </div>
                <div class="notification-details">
                    <span class="notification-amount">${notification.transaction.amount}</span> tokens
                    <br>by <span class="notification-trader">${notification.transaction.trader}</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = notificationItems;
    }

    // Successful address management methods
    viewSuccessAddresses() {
        const successAddresses = localStorage.getItem('memeCoinSuccessAddresses');
        const addressList = successAddresses ? JSON.parse(successAddresses) : [];
        
        if (addressList.length === 0) {
            this.showModal('Successful Addresses', 'No successful address records');
            return;
        }
        
        this.showSuccessAddressModal(addressList);
    }

    showSuccessAddressModal(addresses) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = 'Successful Address List';
        modalBody.innerHTML = this.generateSuccessAddressTable(addresses);
        
        modal.classList.add('show');
    }

    generateSuccessAddressTable(addresses) {
        return `
            <div class="table-container">
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>Address</th>
                            <th>Volume</th>
                            <th>Time</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${addresses.map(addr => `
                            <tr>
                                <td style="font-family: 'Courier New', monospace; font-size: 0.8rem;">${addr.address}</td>
                                <td style="color: var(--success-color); font-weight: bold;">${addr.amount} tokens</td>
                                <td>${addr.time}</td>
                                <td>${addr.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    clearSuccessAddresses() {
        this.showModal('Confirm Clear', 'Are you sure you want to clear all successful address records? This action cannot be undone.', () => {
            localStorage.removeItem('memeCoinSuccessAddresses');
            this.updateSuccessAddressStats();
            this.log('Successful address records cleared', 'warning');
        });
    }

    exportSuccessAddresses() {
        const successAddresses = localStorage.getItem('memeCoinSuccessAddresses');
        const addressList = successAddresses ? JSON.parse(successAddresses) : [];
        
        if (addressList.length === 0) {
            this.showModal('Export Failed', 'No successful address records to export');
            return;
        }
        
        const csv = this.generateSuccessAddressCSV(addressList);
        const filename = `success_addresses_${new Date().toISOString().split('T')[0]}.csv`;
        this.downloadFile(filename, csv);
        this.log('Successful address records exported', 'success');
    }

    generateSuccessAddressCSV(addresses) {
        const headers = ['Address', 'Volume', 'Time', 'Date', 'Timestamp'];
        const rows = addresses.map(addr => [
            addr.address,
            addr.amount,
            addr.time,
            addr.date,
            addr.timestamp
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    updateSuccessAddressStats() {
        try {
            const successAddresses = localStorage.getItem('memeCoinSuccessAddresses');
            const addressList = successAddresses ? JSON.parse(successAddresses) : [];
            
            // Update statistics
            const currentAddressCount = document.getElementById('currentAddressCount');
            const todayNewAddresses = document.getElementById('todayNewAddresses');
            const lastAddressUpdate = document.getElementById('lastAddressUpdate');
            const totalAddressVolume = document.getElementById('totalAddressVolume');
            
            if (currentAddressCount) {
                currentAddressCount.textContent = addressList.length;
            }
            
            if (totalAddressVolume) {
                const totalVolume = addressList.reduce((sum, addr) => sum + parseInt(addr.amount), 0);
                totalAddressVolume.textContent = `${totalVolume.toLocaleString()} tokens`;
            }
            
            if (lastAddressUpdate) {
                if (addressList.length > 0) {
                    const lastUpdate = new Date(addressList[0].timestamp);
                    lastAddressUpdate.textContent = lastUpdate.toLocaleString();
                } else {
                    lastAddressUpdate.textContent = 'None';
                }
            }
            
            // Calculate today's new address count
            if (todayNewAddresses) {
                const today = new Date().toDateString();
                const todayCount = addressList.filter(addr => 
                    new Date(addr.timestamp).toDateString() === today
                ).length;
                todayNewAddresses.textContent = todayCount;
            }
            
            // Update address list display
            this.updateAdminSuccessAddresses(addressList);
            
        } catch (error) {
            console.error('Failed to update success address stats:', error);
        }
    }

    updateAdminSuccessAddresses(addressList) {
        const container = document.getElementById('adminSuccessAddresses');
        if (!container) return;
        
        if (addressList.length === 0) {
            container.innerHTML = '<div class="no-addresses">No successful addresses</div>';
            return;
        }
        
        container.innerHTML = addressList.map(addr => `
            <div class="admin-address-item">
                <div class="admin-address-info">
                    <div class="admin-address-text">${addr.address}</div>
                    <div class="admin-address-details">${addr.date} ${addr.time}</div>
                </div>
                <div class="admin-address-amount">${addr.amount} tokens</div>
            </div>
        `).join('');
    }

    // Holdings snapshot management methods
    viewHoldersSnapshots() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('memeCoinHoldersSnapshots') || '[]');
            const rewardSnapshots = snapshots.filter(snapshot => snapshot.type === 'reward_end');
            
            // Add test data if no snapshots exist (for testing purposes)
            if (rewardSnapshots.length === 0) {
                console.log('No holdings snapshots found, creating test data for demonstration');
                const testSnapshots = [
                    {
                        snapshotId: 'test_snapshot_1',
                        timestamp: Date.now() - 3600000, // 1 hour ago
                        tokenAddress: 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh',
                        type: 'reward_end',
                        holders: [
                            { rank: 1, address: 'ABC123...XYZ789', balance: 1000000 },
                            { rank: 2, address: 'DEF456...UVW012', balance: 500000 },
                            { rank: 3, address: 'GHI789...RST345', balance: 250000 }
                        ]
                    },
                    {
                        snapshotId: 'test_snapshot_2',
                        timestamp: Date.now() - 7200000, // 2 hours ago
                        tokenAddress: 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh',
                        type: 'reward_end',
                        holders: [
                            { rank: 1, address: 'ABC123...XYZ789', balance: 950000 },
                            { rank: 2, address: 'DEF456...UVW012', balance: 480000 },
                            { rank: 3, address: 'GHI789...RST345', balance: 240000 }
                        ]
                    }
                ];
                
                // Save test data to localStorage
                localStorage.setItem('memeCoinHoldersSnapshots', JSON.stringify(testSnapshots));
                rewardSnapshots.push(...testSnapshots);
                
                this.log('Test holdings snapshots created for demonstration', 'info');
            }
            
            if (rewardSnapshots.length === 0) {
                this.showModal('Notice', 'No holdings snapshot data');
                return;
            }
            
            this.showHoldersSnapshotModal(rewardSnapshots);
        } catch (error) {
            console.error('Failed to view holders snapshots:', error);
            this.showModal('Error', 'Failed to view holdings snapshots');
        }
    }

    // Fix existing snapshots by creating corresponding holding rewards
    fixHoldingRewardsFromSnapshots() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('memeCoinHoldersSnapshots') || '[]');
            const rewardSnapshots = snapshots.filter(snapshot => snapshot.type === 'reward_end');
            const existingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');
            
            let createdCount = 0;
            
            rewardSnapshots.forEach(snapshot => {
                // Check if holding reward already exists for this snapshot
                const existingReward = existingRewards.find(reward => reward.snapshotId === snapshot.snapshotId);
                
                if (!existingReward && snapshot.holders && snapshot.holders.length > 0) {
                    // Extract eligible addresses from snapshot
                    const eligibleAddresses = snapshot.holders.map(holder => holder.address);
                    
                    // Create holding reward record
                    const holdingReward = {
                        id: `holding_reward_${snapshot.timestamp}`,
                        type: 'holding',
                        round: this.getNextHoldingRewardRound(existingRewards),
                        amount: 3000, // Default holding reward amount
                        eligibleAddresses: eligibleAddresses,
                        snapshotId: snapshot.snapshotId,
                        timestamp: snapshot.timestamp,
                        claimed: false,
                        createdAt: new Date().toISOString()
                    };
                    
                    existingRewards.push(holdingReward);
                    createdCount++;
                    
                    console.log(`Created holding reward for snapshot ${snapshot.snapshotId}:`, holdingReward);
                }
            });
            
            if (createdCount > 0) {
                // Save updated holding rewards
                localStorage.setItem('holdingRewards', JSON.stringify(existingRewards));
                this.log(`Fixed ${createdCount} holding rewards from existing snapshots`, 'success');
                this.showModal('Success', `Successfully created ${createdCount} holding rewards from existing snapshots`);
            } else {
                this.showModal('Notice', 'All snapshots already have corresponding holding rewards');
            }
            
        } catch (error) {
            console.error('Failed to fix holding rewards from snapshots:', error);
            this.showModal('Error', 'Failed to fix holding rewards from snapshots');
        }
    }

    getNextHoldingRewardRound(existingRewards) {
        try {
            const maxRound = existingRewards.reduce((max, reward) => {
                return Math.max(max, reward.round || 0);
            }, 0);
            return maxRound + 1;
        } catch (error) {
            console.error('Failed to get next holding reward round:', error);
            return 1;
        }
    }

    // Create test holding rewards for demonstration
    createTestHoldingRewards() {
        try {
            // Create test snapshots with real addresses
            const testSnapshots = [
                {
                    snapshotId: 'real_test_snapshot_1',
                    timestamp: Date.now() - 3600000, // 1 hour ago
                    tokenAddress: 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh',
                    type: 'reward_end',
                    holders: [
                        { rank: 1, address: 'ABC123456789012345678901234567890123456789', balance: 1000000 },
                        { rank: 2, address: 'DEF456789012345678901234567890123456789012', balance: 500000 },
                        { rank: 3, address: 'GHI789012345678901234567890123456789012345', balance: 250000 }
                    ]
                },
                {
                    snapshotId: 'real_test_snapshot_2',
                    timestamp: Date.now() - 7200000, // 2 hours ago
                    tokenAddress: 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh',
                    type: 'reward_end',
                    holders: [
                        { rank: 1, address: 'ABC123456789012345678901234567890123456789', balance: 950000 },
                        { rank: 2, address: 'DEF456789012345678901234567890123456789012', balance: 480000 },
                        { rank: 3, address: 'GHI789012345678901234567890123456789012345', balance: 240000 }
                    ]
                }
            ];

            // Save test snapshots
            localStorage.setItem('memeCoinHoldersSnapshots', JSON.stringify(testSnapshots));
            
            // Create corresponding holding rewards
            const existingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');
            
            testSnapshots.forEach((snapshot, index) => {
                const eligibleAddresses = snapshot.holders.map(holder => holder.address);
                
                const holdingReward = {
                    id: `test_holding_reward_${index + 1}`,
                    type: 'holding',
                    round: existingRewards.length + index + 1,
                    amount: 3000,
                    eligibleAddresses: eligibleAddresses,
                    snapshotId: snapshot.snapshotId,
                    timestamp: snapshot.timestamp,
                    claimed: false,
                    createdAt: new Date().toISOString()
                };
                
                existingRewards.push(holdingReward);
            });
            
            localStorage.setItem('holdingRewards', JSON.stringify(existingRewards));
            
            this.log('Test holding rewards created successfully', 'success');
            this.showModal('Success', 'Test holding rewards created successfully. You can now test the claim functionality.');
            
        } catch (error) {
            console.error('Failed to create test holding rewards:', error);
            this.showModal('Error', 'Failed to create test holding rewards');
        }
    }

    // Create test main countdown rewards for demonstration
    createTestMainCountdownRewards() {
        try {
            // Create test main countdown rewards
            const testMainCountdownRewards = [
                {
                    id: 'test_main_countdown_reward_1',
                    type: 'main-countdown',
                    round: 1,
                    amount: 10000,
                    winner: 'ABC123456789012345678901234567890123456789',
                    transactionAmount: 1500000,
                    timestamp: Date.now() - 3600000, // 1 hour ago
                    claimed: false,
                    createdAt: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 'test_main_countdown_reward_2',
                    type: 'main-countdown',
                    round: 2,
                    amount: 10000,
                    winner: 'DEF456789012345678901234567890123456789012',
                    transactionAmount: 2000000,
                    timestamp: Date.now() - 7200000, // 2 hours ago
                    claimed: false,
                    createdAt: new Date(Date.now() - 7200000).toISOString()
                }
            ];

            // Save test main countdown rewards
            localStorage.setItem('mainCountdownRewards', JSON.stringify(testMainCountdownRewards));
            
            this.log('Test main countdown rewards created successfully', 'success');
            this.showModal('Success', 'Test main countdown rewards created successfully. You can now test the main countdown claim functionality.');
            
        } catch (error) {
            console.error('Failed to create test main countdown rewards:', error);
            this.showModal('Error', 'Failed to create test main countdown rewards');
        }
    }

    showHoldersSnapshotModal(snapshots) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = 'Holdings Snapshot List';
            modalContent.innerHTML = this.generateHoldersSnapshotTable(snapshots);
            modal.style.display = 'block';
        }
    }

    generateHoldersSnapshotTable(snapshots) {
        let tableHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Snapshot ID</th>
                            <th>Time</th>
                            <th>Token Address</th>
                            <th>Holdings Count</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        snapshots.forEach((snapshot, index) => {
            const date = new Date(snapshot.timestamp).toLocaleString();
            const holderCount = snapshot.holders ? snapshot.holders.length : 0;
            
            tableHTML += `
                <tr>
                    <td>${snapshot.snapshotId}</td>
                    <td>${date}</td>
                    <td>${snapshot.tokenAddress ? snapshot.tokenAddress.slice(0, 8) + '...' + snapshot.tokenAddress.slice(-8) : '--'}</td>
                    <td>${holderCount}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.adminApp.configManager.viewSnapshotDetails('${snapshot.snapshotId}')">
                            View Details
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        return tableHTML;
    }

    viewSnapshotDetails(snapshotId) {
        try {
            const snapshots = JSON.parse(localStorage.getItem('memeCoinHoldersSnapshots') || '[]');
            const snapshot = snapshots.find(s => s.snapshotId === snapshotId);
            
            if (!snapshot) {
                this.showModal('Error', 'Snapshot does not exist');
                return;
            }
            
            this.showSnapshotDetailsModal(snapshot);
        } catch (error) {
            console.error('Failed to view snapshot details:', error);
            this.showModal('Error', 'Failed to view snapshot details');
        }
    }

    showSnapshotDetailsModal(snapshot) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = `Holdings Snapshot Details - ${snapshot.snapshotId}`;
            modalContent.innerHTML = this.generateSnapshotDetailsTable(snapshot);
            modal.style.display = 'block';
        }
    }

    generateSnapshotDetailsTable(snapshot) {
        let tableHTML = `
            <div class="snapshot-info">
                <p><strong>Snapshot Time:</strong> ${new Date(snapshot.timestamp).toLocaleString()}</p>
                <p><strong>Token Address:</strong> ${snapshot.tokenAddress}</p>
                <p><strong>Holdings Count:</strong> ${snapshot.holders ? snapshot.holders.length : 0}</p>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Address</th>
                            <th>Holdings</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (snapshot.holders && snapshot.holders.length > 0) {
            snapshot.holders.forEach(holder => {
                tableHTML += `
                    <tr>
                        <td>#${holder.rank}</td>
                        <td>${holder.address}</td>
                        <td>${this.formatBalance(holder.balance)}</td>
                    </tr>
                `;
            });
        } else {
            tableHTML += '<tr><td colspan="3">No holdings data</td></tr>';
        }
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        return tableHTML;
    }

    exportHoldersSnapshots() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('memeCoinHoldersSnapshots') || '[]');
            const rewardSnapshots = snapshots.filter(snapshot => snapshot.type === 'reward_end');
            
            if (rewardSnapshots.length === 0) {
                this.showModal('Notice', 'No holdings snapshot data to export');
                return;
            }
            
            const csvContent = this.generateHoldersSnapshotCSV(rewardSnapshots);
            const filename = `holders_snapshots_${new Date().toISOString().slice(0, 10)}.csv`;
            this.downloadFile(filename, csvContent);
            
            this.log(`Holdings snapshots exported successfully, total ${rewardSnapshots.length} snapshots`, 'success');
        } catch (error) {
            console.error('Failed to export holders snapshots:', error);
            this.showModal('Error', 'Failed to export holdings snapshots');
        }
    }

    generateHoldersSnapshotCSV(snapshots) {
        let csv = 'Snapshot ID,Time,Token Address,Holdings Count\n';
        
        snapshots.forEach(snapshot => {
            const date = new Date(snapshot.timestamp).toLocaleString();
            const holderCount = snapshot.holders ? snapshot.holders.length : 0;
            const tokenAddress = snapshot.tokenAddress || '';
            
            csv += `"${snapshot.snapshotId}","${date}","${tokenAddress}",${holderCount}\n`;
        });
        
        return csv;
    }

    clearHoldersSnapshots() {
        this.showModal('Confirm', 'Are you sure you want to clear all holdings snapshot data? This action cannot be undone.', () => {
            try {
                localStorage.removeItem('memeCoinHoldersSnapshots');
                this.updateHoldersSnapshotStats();
                this.log('Holdings snapshot data cleared', 'success');
            } catch (error) {
                console.error('Failed to clear holders snapshots:', error);
                this.showModal('Error', 'Failed to clear holdings snapshots');
            }
        });
    }

    // Main Countdown Address Snapshot Management Methods
    viewMainCountdownSnapshots() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
            if (snapshots.length === 0) {
                this.showModal('Info', 'No main countdown address snapshots found.');
                return;
            }
            
            this.showMainCountdownSnapshotModal(snapshots);
        } catch (error) {
            console.error('Failed to view main countdown snapshots:', error);
            this.showModal('Error', 'Failed to load main countdown snapshots');
        }
    }

    showMainCountdownSnapshotModal(snapshots) {
        const modalContent = document.getElementById('transactionModalContent');
        if (!modalContent) return;

        const table = this.generateMainCountdownSnapshotTable(snapshots);
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">Main Countdown Address Snapshots</h3>
                <button class="modal-close" onclick="window.adminApp.configManager.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="table-container">
                    ${table}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="window.adminApp.configManager.closeModal()">Close</button>
            </div>
        `;

        document.getElementById('transactionModal').style.display = 'block';
    }

    generateMainCountdownSnapshotTable(snapshots) {
        if (snapshots.length === 0) {
            return '<div class="no-data">No main countdown address snapshots found</div>';
        }

        const rows = snapshots.map((snapshot, index) => {
            const date = new Date(snapshot.timestamp).toLocaleString();
            const winner = snapshot.winner || 'Unknown';
            const amount = snapshot.transactionAmount ? this.formatBalance(snapshot.transactionAmount) : 'N/A';
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${snapshot.snapshotId}</td>
                    <td>${winner}</td>
                    <td>${amount}</td>
                    <td>${date}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.adminApp.configManager.viewMainCountdownSnapshotDetails('${snapshot.snapshotId}')">
                            <i class="fa fa-eye"></i> Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Snapshot ID</th>
                        <th>Winner Address</th>
                        <th>Transaction Amount</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    viewMainCountdownSnapshotDetails(snapshotId) {
        try {
            const snapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
            const snapshot = snapshots.find(s => s.snapshotId === snapshotId);
            
            if (!snapshot) {
                this.showModal('Error', 'Snapshot not found');
                return;
            }
            
            this.showMainCountdownSnapshotDetailsModal(snapshot);
        } catch (error) {
            console.error('Failed to view snapshot details:', error);
            this.showModal('Error', 'Failed to load snapshot details');
        }
    }

    showMainCountdownSnapshotDetailsModal(snapshot) {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;

        const detailsTable = this.generateMainCountdownSnapshotDetailsTable(snapshot);
        modalContent.innerHTML = `
            <div class="snapshot-details">
                <h4>Main Countdown Address Snapshot Details</h4>
                ${detailsTable}
            </div>
        `;

        document.getElementById('modalTitle').textContent = `Snapshot: ${snapshot.snapshotId}`;
        document.getElementById('modal').style.display = 'block';
    }

    generateMainCountdownSnapshotDetailsTable(snapshot) {
        const evidence = snapshot.evidence || {};
        
        return `
            <table class="details-table">
                <tr>
                    <td><strong>Snapshot ID:</strong></td>
                    <td>${snapshot.snapshotId}</td>
                </tr>
                <tr>
                    <td><strong>Type:</strong></td>
                    <td>${snapshot.type}</td>
                </tr>
                <tr>
                    <td><strong>Winner Address:</strong></td>
                    <td>${snapshot.winner}</td>
                </tr>
                <tr>
                    <td><strong>Transaction Amount:</strong></td>
                    <td>${snapshot.transactionAmount ? this.formatBalance(snapshot.transactionAmount) : 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Timestamp:</strong></td>
                    <td>${new Date(snapshot.timestamp).toLocaleString()}</td>
                </tr>
                <tr>
                    <td><strong>Created:</strong></td>
                    <td>${new Date(snapshot.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                    <td><strong>Evidence Address:</strong></td>
                    <td>${evidence.address || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Transaction Signature:</strong></td>
                    <td>${evidence.transactionSignature || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Transaction Type:</strong></td>
                    <td>${evidence.transactionType || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Block Time:</strong></td>
                    <td>${evidence.blockTime ? new Date(evidence.blockTime * 1000).toLocaleString() : 'N/A'}</td>
                </tr>
            </table>
        `;
    }

    exportMainCountdownSnapshots() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
            if (snapshots.length === 0) {
                this.showModal('Info', 'No main countdown address snapshots to export.');
                return;
            }
            
            const csv = this.generateMainCountdownSnapshotCSV(snapshots);
            const filename = `main_countdown_snapshots_${new Date().toISOString().split('T')[0]}.csv`;
            this.downloadFile(filename, csv);
            
            this.log('Main countdown snapshots exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export main countdown snapshots:', error);
            this.showModal('Error', 'Failed to export main countdown snapshots');
        }
    }

    generateMainCountdownSnapshotCSV(snapshots) {
        const headers = ['Snapshot ID', 'Type', 'Winner Address', 'Transaction Amount', 'Timestamp', 'Created', 'Evidence Address', 'Transaction Signature', 'Transaction Type', 'Block Time'];
        
        const rows = snapshots.map(snapshot => {
            const evidence = snapshot.evidence || {};
            return [
                snapshot.snapshotId,
                snapshot.type,
                snapshot.winner,
                snapshot.transactionAmount || '',
                new Date(snapshot.timestamp).toISOString(),
                snapshot.createdAt,
                evidence.address || '',
                evidence.transactionSignature || '',
                evidence.transactionType || '',
                evidence.blockTime ? new Date(evidence.blockTime * 1000).toISOString() : ''
            ];
        });
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    fixMainCountdownRewardsFromSnapshots() {
        this.showModal('Confirm', 'This will create main countdown rewards for any snapshots that don\'t have corresponding rewards. Continue?', () => {
            try {
                const snapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
                const existingRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
                
                let createdCount = 0;
                
                snapshots.forEach(snapshot => {
                    // Check if reward already exists for this snapshot
                    const existingReward = existingRewards.find(reward => reward.snapshotId === snapshot.snapshotId);
                    
                    if (!existingReward) {
                        const newReward = {
                            id: `main_countdown_reward_${Date.now()}_${createdCount}`,
                            type: 'main-countdown',
                            round: this.getNextMainCountdownRewardRound(existingRewards),
                            amount: 10000,
                            winner: snapshot.winner,
                            transactionAmount: snapshot.transactionAmount,
                            timestamp: snapshot.timestamp,
                            claimed: false,
                            createdAt: new Date().toISOString(),
                            snapshotId: snapshot.snapshotId,
                            evidence: snapshot.evidence
                        };
                        
                        existingRewards.push(newReward);
                        createdCount++;
                    }
                });
                
                if (createdCount > 0) {
                    localStorage.setItem('mainCountdownRewards', JSON.stringify(existingRewards));
                    this.log(`Created ${createdCount} main countdown rewards from snapshots`, 'success');
                } else {
                    this.log('No new main countdown rewards needed', 'info');
                }
                
                this.updateMainCountdownSnapshotStats();
                this.updateRewardDataStats();
            } catch (error) {
                console.error('Failed to fix main countdown rewards:', error);
                this.showModal('Error', 'Failed to fix main countdown rewards');
            }
        });
    }

    getNextMainCountdownRewardRound(existingRewards) {
        try {
            const maxRound = existingRewards.reduce((max, reward) => {
                return Math.max(max, reward.round || 0);
            }, 0);
            return maxRound + 1;
        } catch (error) {
            console.error('Failed to get next main countdown reward round:', error);
            return 1;
        }
    }

    createTestMainCountdownSnapshot() {
        try {
            const testSnapshot = {
                snapshotId: `test_main_countdown_snapshot_${Date.now()}`,
                type: 'main_countdown_end',
                winner: 'TestWinnerAddress123456789',
                transactionAmount: 1500000,
                transaction: {
                    signature: 'test_signature_123',
                    type: 'buy',
                    amount: 1500000,
                    trader: 'TestWinnerAddress123456789',
                    blockTime: Math.floor(Date.now() / 1000)
                },
                timestamp: Date.now(),
                createdAt: new Date().toISOString(),
                evidence: {
                    address: 'TestWinnerAddress123456789',
                    transactionSignature: 'test_signature_123',
                    transactionAmount: 1500000,
                    transactionType: 'buy',
                    blockTime: Math.floor(Date.now() / 1000)
                }
            };

            const snapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
            snapshots.push(testSnapshot);
            
            if (snapshots.length > 20) {
                snapshots.shift();
            }

            localStorage.setItem('mainCountdownAddressSnapshots', JSON.stringify(snapshots));
            
            this.updateMainCountdownSnapshotStats();
            this.log('Test main countdown snapshot created successfully', 'success');
        } catch (error) {
            console.error('Failed to create test main countdown snapshot:', error);
            this.showModal('Error', 'Failed to create test main countdown snapshot');
        }
    }

    clearMainCountdownSnapshots() {
        this.showModal('Confirm', 'Are you sure you want to clear all main countdown address snapshot data? This action cannot be undone.', () => {
            try {
                localStorage.removeItem('mainCountdownAddressSnapshots');
                this.updateMainCountdownSnapshotStats();
                this.log('Main countdown address snapshot data cleared', 'success');
            } catch (error) {
                console.error('Failed to clear main countdown snapshots:', error);
                this.showModal('Error', 'Failed to clear main countdown snapshots');
            }
        });
    }

    updateMainCountdownSnapshotStats() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
            const count = snapshots.length;
            
            // Update status display
            const statusDot = document.getElementById('mainCountdownSnapshotStatusDot');
            const statusText = document.getElementById('mainCountdownSnapshotStatusText');
            const countElement = document.getElementById('mainCountdownSnapshotCount');
            const latestElement = document.getElementById('mainCountdownSnapshotLatest');
            const winnerElement = document.getElementById('mainCountdownSnapshotWinner');
            
            if (statusDot) {
                statusDot.textContent = count > 0 ? '🟢' : '🔴';
            }
            
            if (statusText) {
                statusText.textContent = count > 0 ? `${count} snapshots` : 'No snapshots';
            }
            
            if (countElement) {
                countElement.textContent = count;
            }
            
            if (latestElement && snapshots.length > 0) {
                const latest = snapshots[snapshots.length - 1];
                const date = new Date(latest.timestamp).toLocaleString();
                latestElement.textContent = date;
            }
            
            if (winnerElement && snapshots.length > 0) {
                const latest = snapshots[snapshots.length - 1];
                winnerElement.textContent = latest.winner || 'Unknown';
            }
        } catch (error) {
            console.error('Failed to update main countdown snapshot stats:', error);
        }
    }

    updateHoldersSnapshotStats() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('memeCoinHoldersSnapshots') || '[]');
            const rewardSnapshots = snapshots.filter(snapshot => snapshot.type === 'reward_end');
            const count = rewardSnapshots.length;
            
            // Update status display
            const statusDot = document.getElementById('holdersSnapshotStatusDot');
            const statusText = document.getElementById('holdersSnapshotStatusText');
            const countElement = document.getElementById('holdersSnapshotCount');
            const latestElement = document.getElementById('holdersSnapshotLatest');
            
            if (statusDot) {
                statusDot.textContent = count > 0 ? '🟢' : '🔴';
            }
            
            if (statusText) {
                statusText.textContent = count > 0 ? `${count} snapshots` : 'No snapshots';
            }
            
            if (countElement) {
                countElement.textContent = count;
            }
            
            if (latestElement && rewardSnapshots.length > 0) {
                const latest = rewardSnapshots[rewardSnapshots.length - 1];
                const date = new Date(latest.timestamp).toLocaleString();
                latestElement.textContent = date;
            }
        } catch (error) {
            console.error('Failed to update holders snapshot stats:', error);
        }
    }

    formatBalance(balance) {
        if (balance >= 1000000) {
            return (balance / 1000000).toFixed(2) + 'M';
        } else if (balance >= 1000) {
            return (balance / 1000).toFixed(2) + 'K';
        } else {
            return balance.toFixed(2);
        }
    }

    // Reward data management methods
    updateRewardDataStats() {
        try {
            const mainCountdownRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const holdingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');
            const rewardHistory = JSON.parse(localStorage.getItem('rewardHistory') || '[]');

            // Update statistics display
            const mainCountdownCount = document.getElementById('mainCountdownRewardCount');
            const holdingCount = document.getElementById('holdingRewardCount');
            const claimedCount = document.getElementById('claimedRewardCount');
            const totalPoints = document.getElementById('totalRewardPoints');

            if (mainCountdownCount) {
                mainCountdownCount.textContent = `${mainCountdownRewards.length} rounds`;
            }

            if (holdingCount) {
                holdingCount.textContent = `${holdingRewards.length} rounds`;
            }

            if (claimedCount) {
                const claimedRewards = rewardHistory.length;
                claimedCount.textContent = `${claimedRewards} times`;
            }

            if (totalPoints) {
                const totalMainPoints = mainCountdownRewards.reduce((sum, reward) => sum + (reward.amount || 10000), 0);
                const totalHoldingPoints = holdingRewards.reduce((sum, reward) => sum + (reward.amount || 3000), 0);
                const total = totalMainPoints + totalHoldingPoints;
                totalPoints.textContent = `${total.toLocaleString()} points`;
            }

            // Update recent reward records
            this.updateRecentRewards();

            // Update status indicators
            const statusDot = document.getElementById('rewardDataStatusDot');
            const statusText = document.getElementById('rewardDataStatusText');
            
            if (statusDot) {
                const totalRewards = mainCountdownRewards.length + holdingRewards.length;
                statusDot.textContent = totalRewards > 0 ? '🟢' : '🔴';
            }
            
            if (statusText) {
                const totalRewards = mainCountdownRewards.length + holdingRewards.length;
                statusText.textContent = totalRewards > 0 ? `${totalRewards} reward rounds` : 'No rewards';
            }
        } catch (error) {
            console.error('Failed to update reward data stats:', error);
        }
    }

    updateRecentRewards() {
        try {
            const mainCountdownRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const holdingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');
            const recentRewardsContainer = document.getElementById('recentRewards');

            if (!recentRewardsContainer) return;

            // Merge all rewards and sort by time
            const allRewards = [
                ...mainCountdownRewards.map(reward => ({ ...reward, type: 'main-countdown' })),
                ...holdingRewards.map(reward => ({ ...reward, type: 'holding' }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Only show the latest 5 rewards
            const recentRewards = allRewards.slice(0, 5);

            if (recentRewards.length === 0) {
                recentRewardsContainer.innerHTML = '<div class="no-rewards">No reward records</div>';
                return;
            }

            let html = '';
            recentRewards.forEach(reward => {
                const date = new Date(reward.timestamp).toLocaleString();
                const amount = reward.amount || (reward.type === 'main-countdown' ? 10000 : 3000);
                const status = reward.claimed ? 'claimed' : 'unclaimed';
                const statusText = reward.claimed ? 'Claimed' : 'Unclaimed';
                
                let winner = '';
                if (reward.type === 'main-countdown') {
                    winner = reward.winner || 'Unknown';
                } else {
                    winner = reward.eligibleAddresses ? reward.eligibleAddresses.length + ' addresses' : '0 addresses';
                }

                html += `
                    <div class="reward-item">
                        <div class="reward-header">
                            <div class="reward-type ${reward.type}">
                                <i class="fa fa-${reward.type === 'main-countdown' ? 'trophy' : 'diamond'}"></i>
                                ${reward.type === 'main-countdown' ? 'Main Countdown Reward' : 'Holding Reward'}
                            </div>
                            <div class="reward-time">${date}</div>
                        </div>
                        <div class="reward-details">
                            <div class="reward-winner">${winner}</div>
                            <div class="reward-amount">${amount.toLocaleString()} points</div>
                            <div class="reward-status ${status}">${statusText}</div>
                        </div>
                    </div>
                `;
            });

            recentRewardsContainer.innerHTML = html;
        } catch (error) {
            console.error('Failed to update recent rewards:', error);
        }
    }

    viewRewardData() {
        try {
            const mainCountdownRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const holdingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');

            const allRewards = [
                ...mainCountdownRewards.map(reward => ({ ...reward, type: 'main-countdown' })),
                ...holdingRewards.map(reward => ({ ...reward, type: 'holding' }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            this.showRewardDataModal(allRewards);
        } catch (error) {
            console.error('Failed to view reward data:', error);
            this.log('Failed to view reward data', 'error');
        }
    }

    showRewardDataModal(rewards) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = 'Reward Data Details';
        
        if (rewards.length === 0) {
            modalContent.innerHTML = '<p style="text-align: center; color: #9CA3AF;">No reward data</p>';
        } else {
            let html = `
                <div class="table-container">
                    <table class="reward-history-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Time</th>
                                <th>Winner</th>
                                <th>Points</th>
                                <th>Status</th>
                                <th>Evidence</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            rewards.forEach(reward => {
                const date = new Date(reward.timestamp).toLocaleString();
                const amount = reward.amount || (reward.type === 'main-countdown' ? 10000 : 3000);
                const status = reward.claimed ? 'claimed' : 'unclaimed';
                const statusText = reward.claimed ? 'Claimed' : 'Unclaimed';
                
                let winner = '';
                let evidenceInfo = '';
                
                if (reward.type === 'main-countdown') {
                    winner = reward.winner || 'Unknown';
                    if (reward.evidence) {
                        evidenceInfo = `
                            <div class="evidence-info">
                                <div><strong>Address:</strong> ${reward.evidence.address || 'N/A'}</div>
                                <div><strong>Signature:</strong> ${reward.evidence.transactionSignature ? reward.evidence.transactionSignature.substring(0, 20) + '...' : 'N/A'}</div>
                                <div><strong>Amount:</strong> ${reward.evidence.transactionAmount ? this.formatBalance(reward.evidence.transactionAmount) : 'N/A'}</div>
                            </div>
                        `;
                    } else {
                        evidenceInfo = '<span class="no-evidence">No evidence data</span>';
                    }
                } else {
                    winner = reward.eligibleAddresses ? reward.eligibleAddresses.length + ' addresses' : '0 addresses';
                    evidenceInfo = '<span class="holding-evidence">Holding snapshot</span>';
                }

                html += `
                    <tr>
                        <td>
                            <span class="reward-type ${reward.type}">
                                <i class="fa fa-${reward.type === 'main-countdown' ? 'trophy' : 'diamond'}"></i>
                                ${reward.type === 'main-countdown' ? 'Main Countdown' : 'Holding Reward'}
                            </span>
                        </td>
                        <td>${date}</td>
                        <td class="reward-history-address">${winner}</td>
                        <td class="reward-history-amount">${amount.toLocaleString()}</td>
                        <td><span class="reward-history-status ${status}">${statusText}</span></td>
                        <td class="reward-evidence">${evidenceInfo}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            modalContent.innerHTML = html;
        }

        modal.classList.add('show');
    }

    exportRewardData() {
        try {
            const mainCountdownRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const holdingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');

            const allRewards = [
                ...mainCountdownRewards.map(reward => ({ ...reward, type: 'main-countdown' })),
                ...holdingRewards.map(reward => ({ ...reward, type: 'holding' }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const csv = this.generateRewardDataCSV(allRewards);
            const filename = `reward_data_${new Date().toISOString().split('T')[0]}.csv`;
            this.downloadFile(filename, csv);
            this.log('Reward data exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export reward data:', error);
            this.log('Failed to export reward data', 'error');
        }
    }

    generateRewardDataCSV(rewards) {
        const headers = ['Type', 'Time', 'Winner', 'Points', 'Status', 'Round'];
        const rows = rewards.map(reward => {
            const date = new Date(reward.timestamp).toLocaleString();
            const amount = reward.amount || (reward.type === 'main-countdown' ? 10000 : 3000);
            const status = reward.claimed ? 'Claimed' : 'Unclaimed';
            
            let winner = '';
            if (reward.type === 'main-countdown') {
                winner = reward.winner || 'Unknown';
            } else {
                winner = reward.eligibleAddresses ? reward.eligibleAddresses.length + ' addresses' : '0 addresses';
            }

            return [
                reward.type === 'main-countdown' ? 'Main Countdown Reward' : 'Holding Reward',
                date,
                winner,
                amount,
                status,
                reward.round || 'Unknown'
            ];
        });

        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    viewRewardHistory() {
        try {
            const rewardHistory = JSON.parse(localStorage.getItem('rewardHistory') || '[]');
            this.showRewardHistoryModal(rewardHistory);
        } catch (error) {
            console.error('Failed to view reward history:', error);
            this.log('Failed to view reward history', 'error');
        }
    }

    showRewardHistoryModal(history) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = 'Reward Claim History';
        
        if (history.length === 0) {
            modalContent.innerHTML = '<p style="text-align: center; color: #9CA3AF;">No claim history</p>';
        } else {
            let html = `
                <div class="table-container">
                    <table class="reward-history-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Time</th>
                                <th>Wallet Address</th>
                                <th>Points</th>
                                <th>Round</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            history.forEach(record => {
                const date = new Date(record.timestamp).toLocaleString();
                const address = record.address || 'Unknown';

                html += `
                    <tr>
                        <td>${record.type}</td>
                        <td>${date}</td>
                        <td class="reward-history-address">${address}</td>
                        <td class="reward-history-amount">${record.amount.toLocaleString()}</td>
                        <td>${record.rounds || '1'}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            modalContent.innerHTML = html;
        }

        modal.classList.add('show');
    }

    clearRewardData() {
        this.showModal(
            'Clear Reward Data',
            'Are you sure you want to clear all reward data? This action cannot be undone!',
            () => {
                try {
                    localStorage.removeItem('mainCountdownRewards');
                    localStorage.removeItem('holdingRewards');
                    localStorage.removeItem('rewardHistory');
                    
                    this.updateRewardDataStats();
                    this.log('Reward data cleared', 'success');
                } catch (error) {
                    console.error('Failed to clear reward data:', error);
                    this.log('Failed to clear reward data', 'error');
                }
            }
        );
    }
}

// System Monitor Class
class SystemMonitor {
    constructor() {
        this.startTime = new Date();
        this.init();
    }

    // Initialize monitoring
    init() {
        this.startUptimeCounter();
        this.startRefreshCounter();
        this.startCountdownStatusUpdate();
        this.startRewardCountdownStatusUpdate();
        this.startLargeTransactionStatusUpdate();
        this.startSuccessAddressStatusUpdate();
        this.startHoldersSnapshotStatusUpdate();
        this.startMainCountdownSnapshotStatusUpdate();
        this.startRewardDataStatusUpdate();
        this.startRewardAddressStatusUpdate();
    }

    // Start uptime counter
    startUptimeCounter() {
        setInterval(() => {
            const uptime = document.getElementById('uptime');
            if (uptime) {
                const now = new Date();
                const diff = now - this.startTime;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                uptime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    // Start refresh counter
    startRefreshCounter() {
        let count = 10;
        setInterval(() => {
            const refreshCount = document.getElementById('refreshCount');
            if (refreshCount) {
                count = count === 0 ? 10 : count - 1;
                refreshCount.textContent = count;
            }
        }, 1000);
    }

    // Start countdown status update
    startCountdownStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.checkGlobalCountdown();
                window.adminApp.configManager.updateCountdownStatus();
            }
        }, 1000);
    }

    // Start holding countdown status update
    startRewardCountdownStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateRewardCountdownStatus();
            }
        }, 1000);
    }

    // Start large transaction notification status update
    startLargeTransactionStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateLargeTransactionStats();
            }
        }, 5000); // Update every 5 seconds
    }

    // Start successful address status update
    startSuccessAddressStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateSuccessAddressStats();
            }
        }, 5000); // Update every 5 seconds
    }

    // Start holdings snapshot status update
    startHoldersSnapshotStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateHoldersSnapshotStats();
            }
        }, 5000); // Update every 5 seconds
    }

    // Start main countdown snapshot status update
    startMainCountdownSnapshotStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateMainCountdownSnapshotStats();
            }
        }, 5000); // Update every 5 seconds
    }

    // Start reward data status update
    startRewardDataStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateRewardDataStats();
            }
        }, 5000); // Update every 5 seconds
    }

    // Start reward address status update
    startRewardAddressStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateRewardAddressDisplay();
            }
        }, 5000); // Update every 5 seconds
    }
}

// Main Application Class
class AdminApp {
    constructor() {
        this.configManager = null;
        this.systemMonitor = null;
        this.backendManager = null;
    }

    // Initialize application
    init() {
        this.configManager = new ConfigManager();
        this.systemMonitor = new SystemMonitor();
        
        // Initialize BackendManager for Firebase sync
        this.initBackendManager();
        
        console.log('Meme Coin Admin Management System started');
        this.configManager.log('Admin management system started', 'success');
    }

    // Initialize BackendManager
    initBackendManager() {
        try {
            // Check if BackendManager module is available
            if (typeof BackendManager !== 'undefined') {
                this.backendManager = new BackendManager();
                window.backendManager = this.backendManager;
                this.configManager.log('BackendManager initialized with Firebase sync', 'success');
            } else {
                console.log('BackendManager not available, using localStorage only');
                this.configManager.log('BackendManager not available, using localStorage only', 'warning');
            }
        } catch (error) {
            console.error('Failed to initialize BackendManager:', error);
            this.configManager.log('Failed to initialize BackendManager', 'error');
        }
    }
}

// Initialize application after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AdminApp();
    app.init();
    
    // Mount application instance to global for debugging
    window.adminApp = app;
});

// Clean up resources when page unloads
window.addEventListener('beforeunload', () => {
    if (window.adminApp && window.adminApp.configManager) {
        window.adminApp.configManager.saveConfig();
    }
}); 