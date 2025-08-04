/**
 * Transaction Tracker Module
 * Handles Solana transaction monitoring and management
 */

class TransactionTracker {
    constructor() {
        this.connection = null;
        this.isTracking = false;
        this.tokenAddress = '';
        this.rpcUrl = '';
        this.pollInterval = null;
        this.transactions = [];
        this.maxTransactions = 100;
        this.lastSignature = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.init();
    }

    init() {
        console.log('🔧 Initializing TransactionTracker...');
        this.loadConfig();
        this.setupEventListeners();
        this.checkDetectionControl();
        this.updateSuccessAddressesList(); // Initialize success addresses list
        console.log('✅ TransactionTracker initialized');
    }

    loadConfig() {
        try {
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            if (adminConfig) {
                const config = JSON.parse(adminConfig);
                this.rpcUrl = config.rpc?.url || '';
                this.tokenAddress = config.token?.address || '';
                console.log('📋 Loaded config:', { rpcUrl: this.rpcUrl, tokenAddress: this.tokenAddress });
            } else {
                console.log('⚠️ No admin config found');
            }
        } catch (error) {
            console.error('❌ Failed to load transaction tracker config:', error);
        }
    }

    loadLastSignature() {
        try {
            const lastSigData = localStorage.getItem('memeCoinLastSignature');
            if (lastSigData) {
                const data = JSON.parse(lastSigData);
                // Only use the signature if it's for the same token address
                if (data.tokenAddress === this.tokenAddress) {
                    this.lastSignature = data.signature;
                    console.log('📝 Loaded last signature:', this.lastSignature);
                } else {
                    console.log('🔄 Token address changed, resetting last signature');
                    this.lastSignature = null;
                }
            } else {
                console.log('📝 No last signature found, starting fresh');
                this.lastSignature = null;
            }
        } catch (error) {
            console.error('❌ Failed to load last signature:', error);
            this.lastSignature = null;
        }
    }

    saveLastSignature() {
        try {
            const data = {
                signature: this.lastSignature,
                tokenAddress: this.tokenAddress,
                timestamp: new Date().toISOString()
            };
            
            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinLastSignature', data);
            } else {
                localStorage.setItem('memeCoinLastSignature', JSON.stringify(data));
            }
            console.log('💾 Saved last signature:', this.lastSignature);
        } catch (error) {
            console.error('❌ Failed to save last signature:', error);
        }
    }

    setupEventListeners() {
        // Check for detection control every 10 seconds
        setInterval(() => {
            this.checkDetectionControl();
        }, 10000);
    }

    async connect(rpcUrl) {
        try {
            console.log('🔗 Attempting to connect to Solana RPC:', rpcUrl);
            
            // Check if Solana Web3 is available
            if (typeof window.solanaWeb3 === 'undefined') {
                console.error('❌ Solana Web3.js not loaded');
                // Try to load it dynamically
                await this.loadSolanaWeb3();
            }

            if (!window.solanaWeb3) {
                console.error('❌ Failed to load Solana Web3.js');
                return false;
            }

            // Create connection with proper error handling
            this.connection = new window.solanaWeb3.Connection(rpcUrl, {
                commitment: 'confirmed',
                confirmTransactionInitialTimeout: 60000
            });
            
            // Test the connection
            const version = await this.connection.getVersion();
            console.log('✅ Connected to Solana, version:', version);
            
            this.updateConnectionStatus('connected', 'Connected to Solana');
            this.retryCount = 0; // Reset retry count on successful connection
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to Solana:', error);
            this.updateConnectionStatus('error', `Connection failed: ${error.message}`);
            
            // Retry logic
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 Retrying connection (${this.retryCount}/${this.maxRetries})...`);
                setTimeout(() => {
                    this.connect(rpcUrl);
                }, 5000 * this.retryCount); // Exponential backoff
            }
            
            return false;
        }
    }

    async loadSolanaWeb3() {
        try {
            console.log('📦 Loading Solana Web3.js dynamically...');
            
            // Check if already loaded
            if (typeof window.solanaWeb3 !== 'undefined') {
                console.log('✅ Solana Web3.js already loaded');
                return true;
            }

            // Try to load from CDN
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@solana/web3.js@1.87.6/lib/index.iife.min.js';
            script.async = true;
            
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log('✅ Solana Web3.js loaded successfully');
                    resolve(true);
                };
                script.onerror = () => {
                    console.error('❌ Failed to load Solana Web3.js');
                    reject(new Error('Failed to load Solana Web3.js'));
                };
                document.head.appendChild(script);
            });
        } catch (error) {
            console.error('❌ Error loading Solana Web3.js:', error);
            return false;
        }
    }

    async startTracking(tokenAddress) {
        console.log('🚀 Starting transaction tracking for:', tokenAddress);
        
        if (!this.connection) {
            console.error('❌ Not connected to Solana');
            return false;
        }

        try {
            this.tokenAddress = tokenAddress;
            this.isTracking = true;
            
            // Load the last processed signature from localStorage
            this.loadLastSignature();
            
            this.updateDetectionStatus('running', 'Detecting transactions...');
            this.updateCurrentTokenAddress(tokenAddress);
            
            // Start polling for transactions
            this.startPolling();
            
            console.log('✅ Transaction tracking started successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to start tracking:', error);
            this.updateDetectionStatus('error', 'Failed to start detection');
            return false;
        }
    }

    stopTracking() {
        console.log('🛑 Stopping transaction tracking');
        this.isTracking = false;
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        // Save the last signature before stopping
        if (this.lastSignature) {
            this.saveLastSignature();
        }
        this.updateDetectionStatus('stopped', 'Detection stopped');
    }

    startPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }

        console.log('🔄 Starting transaction polling...');
        this.pollInterval = setInterval(async () => {
            if (this.isTracking) {
                await this.pollTransactions();
            }
        }, 5000); // Poll every 5 seconds to avoid rate limiting
    }

    async pollTransactions() {
        try {
            if (!this.connection || !this.tokenAddress) {
                console.log('⚠️ Missing connection or token address');
                return;
            }

            console.log('🔍 Polling for new transactions...');
            
            const signatures = await this.connection.getSignaturesForAddress(
                new window.solanaWeb3.PublicKey(this.tokenAddress),
                { limit: 10 } // Reduced limit to avoid rate limiting
            );

            console.log(`📊 Found ${signatures.length} signatures`);

            let newTransactionsFound = false;

            for (const sig of signatures) {
                if (this.lastSignature && sig.signature === this.lastSignature) {
                    console.log('🔄 Reached last processed signature, stopping');
                    break; // Already processed
                }

                // Process transaction immediately
                await this.processTransaction(sig.signature, sig.blockTime);
                newTransactionsFound = true;
            }

            // Update the last signature to the most recent one
            if (signatures.length > 0) {
                this.lastSignature = signatures[0].signature;
                this.saveLastSignature();
            }

            // Update UI immediately if new transactions were found
            if (newTransactionsFound) {
                this.updateTransactionStats();
                this.updateTransactionList();
                this.updateLastUpdate();
            }
        } catch (error) {
            console.error('❌ Failed to poll transactions:', error);
            
            // Handle specific error types
            if (error.message.includes('429')) {
                console.log('⚠️ Rate limit exceeded, backing off...');
                // Increase polling interval temporarily
                if (this.pollInterval) {
                    clearInterval(this.pollInterval);
                    this.pollInterval = setInterval(async () => {
                        if (this.isTracking) {
                            await this.pollTransactions();
                        }
                    }, 10000); // Increase to 10 seconds
                }
            } else if (error.message.includes('CORS')) {
                console.error('❌ CORS error detected - this may be a deployment issue');
                this.updateConnectionStatus('error', 'CORS error - check deployment');
            }
        }
    }

// ... existing code ...
