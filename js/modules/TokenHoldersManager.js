/**
 * Token Holders Manager Module
 * Handles real-time token holder data fetching and display
 */

class TokenHoldersManager {
    constructor() {
        this.connection = null;
        this.tokenAddress = '';
        this.rpcUrl = '';
        this.holders = [];
        this.updateInterval = null;
        this.refreshCountdown = 10;
        this.isUpdating = false;
        this.init();
    }

    init() {
        this.loadConfig();
        this.setupEventListeners();
        this.startRefreshCountdown();
        
        // Load cached data if available
        if (this.tokenAddress) {
            this.loadHoldersData();
            this.updateHoldersDisplay();
        }
    }

    loadConfig() {
        try {
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            if (adminConfig) {
                const config = JSON.parse(adminConfig);
                this.rpcUrl = config.rpc?.url || '';
                this.tokenAddress = config.token?.address || '';
            }
        } catch (error) {
            console.error('Failed to load token holders config:', error);
        }
    }

    setupEventListeners() {
        // Check for config updates every 30 seconds
        setInterval(() => {
            this.loadConfig();
        }, 30000);

        // Check for detection control every 10 seconds
        setInterval(() => {
            this.checkDetectionControl();
        }, 10000);
    }

    async connect(rpcUrl) {
        try {
            if (!window.solanaWeb3) {
                console.error('Solana Web3.js not loaded');
                return false;
            }

            console.log('Creating Solana connection for token holders...');
            console.log('RPC URL:', rpcUrl);
            console.log('Solana Web3 object:', window.solanaWeb3);
            
            this.connection = new window.solanaWeb3.Connection(rpcUrl, 'confirmed');
            
            // Verify the connection object
            console.log('Connection object created:', this.connection);
            console.log('Connection methods:', Object.getOwnPropertyNames(this.connection));
            
            // Test the connection
            const version = await this.connection.getVersion();
            console.log('Solana connection version:', version);
            
            // Verify getProgramAccounts method exists
            if (typeof this.connection.getProgramAccounts !== 'function') {
                throw new Error('getProgramAccounts method not found on connection object');
            }
            
            // Log available classes for debugging
            console.log('Available Solana Web3 classes:', Object.keys(window.solanaWeb3));
            console.log('BN available:', !!window.solanaWeb3.BN);
            console.log('u64 available:', !!window.solanaWeb3.u64);
            
            console.log('Token holders manager connected to Solana successfully');
            return true;
        } catch (error) {
            console.error('Failed to connect to Solana for token holders:', error);
            this.connection = null;
            return false;
        }
    }

    async startFetchingHolders() {
        if (!this.tokenAddress) {
            console.log('No token address configured for holders fetching');
            return;
        }

        // Always create our own connection to ensure it's a proper Solana Web3.js connection
        if (this.rpcUrl) {
            const connected = await this.connect(this.rpcUrl);
            if (!connected) {
                console.log('Failed to connect to RPC for holders fetching');
                return;
            }
        } else {
            console.log('No RPC URL configured for holders fetching');
            return;
        }

        // Start fetching holders every 10 seconds
        this.updateInterval = setInterval(async () => {
            if (!this.isUpdating) {
                await this.fetchTopHolders();
            }
        }, 10000);

        // Initial fetch
        await this.fetchTopHolders();
        
        this.isUpdating = true; // Mark as actively updating
    }

    stopFetchingHolders() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isUpdating = false; // Mark as not updating
    }

    async fetchTopHolders() {
        if (!this.connection || !this.tokenAddress) {
            console.log('Cannot fetch holders: connection or token address missing');
            console.log('Connection:', this.connection);
            console.log('Token address:', this.tokenAddress);
            return;
        }

        try {
            this.isUpdating = true;
            console.log('Fetching top token holders for token:', this.tokenAddress);
            console.log('Connection object:', this.connection);
            console.log('Connection type:', typeof this.connection);
            console.log('Connection methods:', Object.getOwnPropertyNames(this.connection));

            // Use getProgramAccounts method as primary approach (as per reference implementation)
            console.log('Using getProgramAccounts method to fetch token holders');
            
            // Token Program ID
            const TOKEN_PROGRAM_ID = new window.solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
            
            const tokenAccounts = await this.connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
                filters: [
                    {
                        dataSize: 165, // Size of token account
                    },
                    {
                        memcmp: {
                            offset: 0,
                            bytes: this.tokenAddress,
                        },
                    },
                ],
                commitment: 'confirmed'
            });

            console.log(`Found ${tokenAccounts.length} token accounts`);

            // Process token accounts to get holder data
            const holders = [];
            const processedOwners = new Set();
            
            // Known LP pool addresses to exclude
            const lpPoolAddresses = [
                'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh' // Main LP pool
            ];

            for (const account of tokenAccounts) {
                const accountInfo = account;
                const data = accountInfo.account.data;
                
                try {
                    // Parse token account data manually
                    const owner = new window.solanaWeb3.PublicKey(data.slice(32, 64)).toString();
                    const amountBuffer = data.slice(64, 72);
                    
                    // Parse amount using BN (Big Number)
                    let amount = 0;
                    if (window.solanaWeb3.BN) {
                        const bn = new window.solanaWeb3.BN(amountBuffer, 'le');
                        amount = bn.toNumber();
                    } else {
                        // Fallback: manually parse the buffer
                        amount = amountBuffer.reduce((acc, byte, index) => {
                            return acc + (byte * Math.pow(256, index));
                        }, 0);
                    }

                    // Skip if amount is 0, owner already processed, or is LP pool address
                    if (amount <= 0 || processedOwners.has(owner) || lpPoolAddresses.includes(owner)) {
                        continue;
                    }

                    processedOwners.add(owner);
                    holders.push({
                        address: owner,
                        balance: amount,
                        rank: 0
                    });
                } catch (error) {
                    console.warn('Failed to parse account data:', error);
                    continue;
                }
            }

            // Sort by balance (descending) and assign ranks
            holders.sort((a, b) => b.balance - a.balance);
            holders.forEach((holder, index) => {
                holder.rank = index + 1;
            });

            // Take top 20
            this.holders = holders.slice(0, 20);
            
            console.log(`Processed ${this.holders.length} top holders`);
            
            // Store holders data for persistence and sync
            this.storeHoldersData();
            
            this.updateHoldersDisplay();
            this.resetRefreshCountdown();

        } catch (error) {
            console.error('Failed to fetch token holders:', error);
            this.updateHoldersDisplayError();
        } finally {
            this.isUpdating = false;
        }
    }

    updateHoldersDisplay() {
        const holderList = document.getElementById('topHolders');
        if (!holderList) return;

        if (this.holders.length === 0) {
            holderList.innerHTML = '<li class="holder-item">No holders found</li>';
            return;
        }

        holderList.innerHTML = this.holders.map(holder => `
            <li class="holder-item" onclick="copyAddress('${holder.address}')" title="Click to copy full address">
                <div class="holder-rank">#${holder.rank}</div>
                <div class="holder-address">${this.formatAddress(holder.address)}</div>
                <div class="holder-balance">${this.formatBalance(holder.balance)}</div>
            </li>
        `).join('');
    }

    updateHoldersDisplayError() {
        const holderList = document.getElementById('topHolders');
        if (!holderList) return;

        holderList.innerHTML = '<li class="holder-item">Error fetching holders</li>';
    }

    formatAddress(address) {
        if (!address) return 'Unknown';
        return address.slice(0, 6) + '...' + address.slice(-4);
    }

    formatBalance(balance) {
        if (balance === null || balance === undefined) return '0';
        
        if (balance >= 1000000) {
            return (balance / 1000000).toFixed(2) + 'M';
        } else if (balance >= 1000) {
            return (balance / 1000).toFixed(2) + 'K';
        } else {
            return balance.toFixed(2);
        }
    }

    startRefreshCountdown() {
        setInterval(() => {
            this.refreshCountdown--;
            if (this.refreshCountdown <= 0) {
                this.refreshCountdown = 10;
            }
            this.updateRefreshCountdown();
        }, 1000);
    }

    resetRefreshCountdown() {
        this.refreshCountdown = 10;
        this.updateRefreshCountdown();
    }

    updateRefreshCountdown() {
        const refreshCountElement = document.getElementById('refreshCount');
        if (refreshCountElement) {
            refreshCountElement.textContent = this.refreshCountdown;
        }
    }

    storeHoldersData() {
        try {
            const holdersData = {
                holders: this.holders,
                timestamp: Date.now(),
                tokenAddress: this.tokenAddress
            };
            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinTokenHolders', holdersData);
            } else {
                localStorage.setItem('memeCoinTokenHolders', JSON.stringify(holdersData));
            }
            console.log('Token holders data stored successfully');
        } catch (error) {
            console.error('Failed to store holders data:', error);
        }
    }

    loadHoldersData() {
        try {
            const storedData = localStorage.getItem('memeCoinTokenHolders');
            if (storedData) {
                const data = JSON.parse(storedData);
                if (data.tokenAddress === this.tokenAddress) {
                    this.holders = data.holders || [];
                    console.log('Loaded cached holders data');
                    return true;
                }
            }
        } catch (error) {
            console.error('Failed to load holders data:', error);
        }
        return false;
    }

    saveHoldersSnapshotOnRewardEnd() {
        try {
            const snapshot = {
                holders: this.holders,
                timestamp: Date.now(),
                tokenAddress: this.tokenAddress,
                snapshotId: `reward_snapshot_${Date.now()}`,
                type: 'reward_end'
            };

            // Store snapshot
            const snapshots = this.getSnapshots();
            snapshots.push(snapshot);
            
            // Keep only last 20 reward snapshots
            if (snapshots.length > 20) {
                snapshots.shift();
            }

            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinHoldersSnapshots', snapshots);
            } else {
                localStorage.setItem('memeCoinHoldersSnapshots', JSON.stringify(snapshots));
            }
            
            console.log('Reward end holders snapshot created:', snapshot.snapshotId);
            console.log('Snapshot data:', snapshot);
            
            // Create corresponding holding reward
            this.createHoldingReward(snapshot);
            
            return snapshot;
        } catch (error) {
            console.error('Failed to create reward end snapshot:', error);
            return null;
        }
    }

    createHoldingReward(snapshot) {
        try {
            // Extract eligible addresses from snapshot
            const eligibleAddresses = snapshot.holders.map(holder => holder.address);
            
            // Create holding reward record
            const holdingReward = {
                id: `holding_reward_${Date.now()}`,
                type: 'holding',
                round: this.getNextHoldingRewardRound(),
                amount: 3000, // Default holding reward amount
                eligibleAddresses: eligibleAddresses,
                snapshotId: snapshot.snapshotId,
                timestamp: snapshot.timestamp,
                claimed: false,
                createdAt: new Date().toISOString()
            };

            // Get existing holding rewards
            const existingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');
            existingRewards.push(holdingReward);
            
            // Keep only last 50 holding rewards
            if (existingRewards.length > 50) {
                existingRewards.shift();
            }

            // Save holding rewards
            localStorage.setItem('holdingRewards', JSON.stringify(existingRewards));
            
            console.log('Holding reward created:', holdingReward.id);
            console.log('Eligible addresses count:', eligibleAddresses.length);
            console.log('Holding reward data:', holdingReward);
            
            return holdingReward;
        } catch (error) {
            console.error('Failed to create holding reward:', error);
            return null;
        }
    }

    getNextHoldingRewardRound() {
        try {
            const existingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');
            const maxRound = existingRewards.reduce((max, reward) => {
                return Math.max(max, reward.round || 0);
            }, 0);
            return maxRound + 1;
        } catch (error) {
            console.error('Failed to get next holding reward round:', error);
            return 1;
        }
    }

    getSnapshots() {
        try {
            const snapshots = localStorage.getItem('memeCoinHoldersSnapshots');
            return snapshots ? JSON.parse(snapshots) : [];
        } catch (error) {
            console.error('Failed to get snapshots:', error);
            return [];
        }
    }

    getRewardSnapshots() {
        const snapshots = this.getSnapshots();
        return snapshots.filter(snapshot => snapshot.type === 'reward_end');
    }

    checkDetectionControl() {
        const detectionConfig = localStorage.getItem('memeCoinDetection');
        if (detectionConfig) {
            try {
                const config = JSON.parse(detectionConfig);
                if (config.isRunning && config.rpcUrl && config.tokenAddress) {
                    if (!this.isUpdating) {
                        this.rpcUrl = config.rpcUrl;
                        this.tokenAddress = config.tokenAddress;
                        this.startFetchingHolders();
                    }
                } else {
                    if (this.isUpdating) {
                        this.stopFetchingHolders();
                    }
                }
            } catch (error) {
                console.error('Failed to parse detection configuration:', error);
            }
        } else {
            if (this.isUpdating) {
                this.stopFetchingHolders();
            }
        }
    }

    start() {
        // Start fetching holders if conditions are met
        this.checkDetectionControl();
    }

    destroy() {
        this.stopFetchingHolders();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TokenHoldersManager };
} else {
    // Browser environment - expose to global scope
    window.TokenHoldersManager = TokenHoldersManager;
} 