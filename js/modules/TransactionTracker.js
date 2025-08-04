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
        this.init();
    }

    init() {
        this.loadConfig();
        this.setupEventListeners();
        this.checkDetectionControl();
        this.updateSuccessAddressesList(); // Initialize success addresses list
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
            console.error('Failed to load transaction tracker config:', error);
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
                    console.log('Loaded last signature:', this.lastSignature);
                } else {
                    console.log('Token address changed, resetting last signature');
                    this.lastSignature = null;
                }
            } else {
                console.log('No last signature found, starting fresh');
                this.lastSignature = null;
            }
        } catch (error) {
            console.error('Failed to load last signature:', error);
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
            console.log('Saved last signature:', this.lastSignature);
        } catch (error) {
            console.error('Failed to save last signature:', error);
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
            if (!window.solanaWeb3) {
                console.error('Solana Web3.js not loaded');
                return false;
            }

            this.connection = new window.solanaWeb3.Connection(rpcUrl, 'confirmed');
            await this.connection.getVersion();
            
            this.updateConnectionStatus('connected', 'Connected to Solana');
            return true;
        } catch (error) {
            console.error('Failed to connect to Solana:', error);
            this.updateConnectionStatus('error', 'Connection failed');
            return false;
        }
    }

    async startTracking(tokenAddress) {
        if (!this.connection) {
            console.error('Not connected to Solana');
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
            
            return true;
        } catch (error) {
            console.error('Failed to start tracking:', error);
            this.updateDetectionStatus('error', 'Failed to start detection');
            return false;
        }
    }

    stopTracking() {
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

        this.pollInterval = setInterval(async () => {
            if (this.isTracking) {
                await this.pollTransactions();
            }
        }, 5000); // Poll every 5 seconds to avoid rate limiting
    }

    async pollTransactions() {
        try {
            if (!this.connection || !this.tokenAddress) return;

            const signatures = await this.connection.getSignaturesForAddress(
                new window.solanaWeb3.PublicKey(this.tokenAddress),
                { limit: 10 } // Reduced limit to avoid rate limiting
            );

            let newTransactionsFound = false;

            for (const sig of signatures) {
                if (this.lastSignature && sig.signature === this.lastSignature) {
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
            console.error('Failed to poll transactions:', error);
        }
    }

    async processTransaction(signature, blockTime) {
        try {
            const tx = await this.connection.getTransaction(signature, {
                maxSupportedTransactionVersion: 0
            });

            if (!tx || this.isTransactionDuplicate(signature)) {
                return;
            }

            // Use real transaction time from blockTime for accurate timing
            let transactionTimestamp;
            let realTransactionTime;
            
            if (blockTime) {
                // Convert blockTime (seconds since epoch) to milliseconds
                realTransactionTime = new Date(blockTime * 1000);
                transactionTimestamp = realTransactionTime.toISOString();
                console.log('Using real transaction time:', {
                    blockTime,
                    realTransactionTime: realTransactionTime.toISOString(),
                    localTime: realTransactionTime.toLocaleString()
                });
            } else {
                // Fallback to current time if blockTime is not available
                realTransactionTime = new Date();
                transactionTimestamp = realTransactionTime.toISOString();
                console.log('Using fallback time (no blockTime available):', {
                    realTransactionTime: realTransactionTime.toISOString(),
                    localTime: realTransactionTime.toLocaleString()
                });
            }

            const transactionData = {
                signature: signature,
                blockTime: blockTime,
                realTransactionTime: realTransactionTime.toISOString(),
                timestamp: transactionTimestamp,
                type: this.determineTransactionType(tx),
                amount: this.extractTokenAmount(tx),
                trader: this.extractTraderAddress(tx),
                status: tx.meta?.err ? 'Failed' : 'Success'
            };

            // Store full address for copy functionality
            transactionData.fullTraderAddress = this.extractFullTraderAddress(tx);
            
            // Check for large transaction (>1,000,000 tokens)
            const tokenAmount = parseFloat(transactionData.amount);
            console.log('Transaction processed:', {
                type: transactionData.type,
                amount: transactionData.amount,
                tokenAmount: tokenAmount,
                isNaN: isNaN(tokenAmount),
                isLarge: !isNaN(tokenAmount) && tokenAmount > 1000000,
                trader: transactionData.trader,
                timestamp: transactionData.timestamp,
                blockTime: blockTime
            });
            
            if (!isNaN(tokenAmount) && tokenAmount > 1000000) {
                console.log('Large transaction detected! Amount:', tokenAmount);
                this.handleLargeTransaction(transactionData);
            } else {
                console.log('Not a large transaction or amount parsing failed');
            }
            
            this.addTransaction(transactionData);
            this.uploadTransactionToBackend(transactionData);

        } catch (error) {
            console.error('Failed to process transaction:', error);
        }
    }

    isTransactionDuplicate(signature) {
        return this.transactions.some(tx => tx.signature === signature);
    }

    addTransaction(transactionData) {
        // Check for duplicates before adding
        const isDuplicate = this.transactions.some(tx => tx.signature === transactionData.signature);
        if (isDuplicate) {
            console.log('Transaction already exists, skipping:', transactionData.signature);
            return;
        }
        
        // Add new transaction to the beginning
        this.transactions.unshift(transactionData);
        
        // Keep only the latest 100 transactions (don't delete, just limit display)
        if (this.transactions.length > this.maxTransactions) {
            // Keep the latest 100 transactions
            this.transactions = this.transactions.slice(0, this.maxTransactions);
            console.log(`Transaction list limited to ${this.maxTransactions} records`);
        }
        
        console.log(`Transaction added. Total records: ${this.transactions.length}`);
    }

    uploadTransactionToBackend(transactionData) {
        try {
            const backendData = localStorage.getItem('memeCoinBackendTransactions');
            let data = backendData ? JSON.parse(backendData) : { transactions: [] };
            
            // Check for duplicates
            const isDuplicate = data.transactions.some(tx => tx.signature === transactionData.signature);
            if (isDuplicate) {
                console.log('Backend transaction already exists, skipping:', transactionData.signature);
                return;
            }

            // Add new transaction to the beginning
            data.transactions.unshift(transactionData);
            
            // Keep only the latest 100 transactions (don't delete, just limit)
            if (data.transactions.length > this.maxTransactions) {
                data.transactions = data.transactions.slice(0, this.maxTransactions);
                console.log(`Backend transaction list limited to ${this.maxTransactions} records`);
            }

            data.lastUpdate = new Date().toISOString();
            
            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinBackendTransactions', data);
            } else {
                localStorage.setItem('memeCoinBackendTransactions', JSON.stringify(data));
            }
            
            console.log(`Backend transaction added. Total records: ${data.transactions.length}`);
            
        } catch (error) {
            console.error('Failed to upload transaction to backend:', error);
        }
    }

    handleLargeTransaction(transactionData) {
        try {
            // Create notification data with transaction's actual timestamp
            const notificationData = {
                type: 'large_transaction',
                timestamp: transactionData.timestamp, // Use transaction's actual timestamp
                transaction: transactionData,
                message: `🚨 LARGE TRANSACTION DETECTED! ${transactionData.type.toUpperCase()} of ${transactionData.amount} tokens by ${transactionData.trader}`
            };

            // Store notification in localStorage for backend
            const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            let notificationList = notifications ? JSON.parse(notifications) : [];
            notificationList.unshift(notificationData);
            
            // Keep only the latest 50 notifications
            if (notificationList.length > 50) {
                notificationList = notificationList.slice(0, 50);
            }
            
            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinLargeTransactionNotifications', notificationList);
            } else {
                localStorage.setItem('memeCoinLargeTransactionNotifications', JSON.stringify(notificationList));
            }

            // Add successful address to the list (only for BUY transactions)
            console.log('Checking transaction type for success address:', {
                type: transactionData.type,
                typeLower: transactionData.type.toLowerCase(),
                isBuy: transactionData.type.toLowerCase() === 'buy'
            });
            
            if (transactionData.type.toLowerCase() === 'buy') {
                console.log('Adding successful address for BUY transaction:', transactionData.trader);
                this.addSuccessfulAddress(transactionData.trader, transactionData.amount);
            }

            // Increase main countdown by 30 seconds
            this.increaseMainCountdown(30);

            // Show notification on frontend
            this.showLargeTransactionNotification(notificationData);

            console.log('Large transaction detected:', notificationData.message);
            
        } catch (error) {
            console.error('Failed to handle large transaction:', error);
        }
    }

    increaseMainCountdown(additionalSeconds) {
        try {
            console.log('Attempting to increase main countdown by', additionalSeconds, 'seconds');
            
            // Get current global countdown
            const globalCountdown = localStorage.getItem('memeCoinCountdown');
            console.log('Current global countdown:', globalCountdown);
            
            let targetDate;
            
            if (globalCountdown) {
                try {
                    const data = JSON.parse(globalCountdown);
                    targetDate = new Date(data.targetDate);
                    console.log('Parsed target date:', targetDate);
                } catch (parseError) {
                    console.error('Failed to parse global countdown:', parseError);
                    targetDate = null;
                }
            }
            
            // If no valid target date, create one from admin config
            if (!targetDate || isNaN(targetDate.getTime())) {
                console.log('No valid target date found, creating from admin config');
                const adminConfig = localStorage.getItem('memeCoinAdminConfig');
                if (adminConfig) {
                    try {
                        const config = JSON.parse(adminConfig);
                        const now = new Date();
                        const currentMinutes = config.countdown?.minutes || 5;
                        const currentSeconds = config.countdown?.seconds || 0;
                        targetDate = new Date(now.getTime() + (currentMinutes * 60 + currentSeconds) * 1000);
                        console.log('Created target date from admin config:', targetDate);
                    } catch (adminError) {
                        console.error('Failed to parse admin config:', adminError);
                        // Fallback: create a 5-minute countdown from now
                        targetDate = new Date(Date.now() + 5 * 60 * 1000);
                        console.log('Created fallback target date:', targetDate);
                    }
                } else {
                    // Fallback: create a 5-minute countdown from now
                    targetDate = new Date(Date.now() + 5 * 60 * 1000);
                    console.log('Created fallback target date:', targetDate);
                }
            }
            
            // Calculate current remaining time
            const now = new Date();
            const currentRemainingTime = targetDate - now;
            const currentRemainingMinutes = Math.floor(currentRemainingTime / (1000 * 60));
            const currentRemainingSeconds = Math.floor((currentRemainingTime % (1000 * 60)) / 1000);
            
            console.log('Current remaining time:', currentRemainingMinutes, 'minutes', currentRemainingSeconds, 'seconds');
            
            // Check if adding seconds would exceed 10 minutes limit
            const totalCurrentSeconds = currentRemainingMinutes * 60 + currentRemainingSeconds;
            const maxAllowedSeconds = 10 * 60; // 10 minutes in seconds
            
            if (totalCurrentSeconds + additionalSeconds > maxAllowedSeconds) {
                console.log(`Cannot increase countdown: would exceed 10-minute limit. Current: ${totalCurrentSeconds}s, trying to add: ${additionalSeconds}s, max: ${maxAllowedSeconds}s`);
                
                // Set to exactly 10 minutes if it would exceed
                const newTargetDate = new Date(now.getTime() + maxAllowedSeconds * 1000);
                console.log('Setting countdown to maximum 10 minutes:', newTargetDate);
                
                // Update global countdown
                const updatedCountdownData = {
                    targetDate: newTargetDate.toISOString(),
                    lastUpdate: new Date().toISOString(),
                    maxReached: true
                };
                
                localStorage.setItem('memeCoinCountdown', JSON.stringify(updatedCountdownData));
                console.log('Updated memeCoinCountdown to maximum:', updatedCountdownData);
                
                // Also update the admin config
                const adminConfig = localStorage.getItem('memeCoinAdminConfig');
                if (adminConfig) {
                    try {
                        const config = JSON.parse(adminConfig);
                        config.countdown = {
                            minutes: 10,
                            seconds: 0,
                            lastUpdate: new Date().toISOString(),
                            maxReached: true
                        };
                        
                        localStorage.setItem('memeCoinAdminConfig', JSON.stringify(config));
                        console.log('Updated admin config countdown to maximum:', config.countdown);
                    } catch (adminError) {
                        console.error('Failed to update admin config:', adminError);
                    }
                }
                
                console.log('Main countdown set to maximum 10 minutes');
                return;
            }
            
            // Add additional seconds to the target date (within limit)
            const newTargetDate = new Date(targetDate.getTime() + (additionalSeconds * 1000));
            console.log('New target date after increase:', newTargetDate);
            
            // Update global countdown
            const updatedCountdownData = {
                targetDate: newTargetDate.toISOString(),
                lastUpdate: new Date().toISOString()
            };
            
            localStorage.setItem('memeCoinCountdown', JSON.stringify(updatedCountdownData));
            console.log('Updated memeCoinCountdown:', updatedCountdownData);
            
            // Also update the admin config
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            if (adminConfig) {
                try {
                    const config = JSON.parse(adminConfig);
                    const remainingTime = newTargetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    config.countdown = {
                        minutes: remainingMinutes,
                        seconds: remainingSeconds,
                        lastUpdate: new Date().toISOString()
                    };
                    
                    localStorage.setItem('memeCoinAdminConfig', JSON.stringify(config));
                    console.log('Updated admin config countdown:', config.countdown);
                } catch (adminError) {
                    console.error('Failed to update admin config:', adminError);
                }
            }
            
            console.log(`Main countdown successfully increased by ${additionalSeconds} seconds`);
            
        } catch (error) {
            console.error('Failed to increase main countdown:', error);
        }
    }

    addSuccessfulAddress(traderAddress, amount) {
        try {
            console.log('addSuccessfulAddress called with:', { traderAddress, amount });
            
            // Get current successful addresses
            const successAddresses = localStorage.getItem('memeCoinSuccessAddresses');
            let addressList = successAddresses ? JSON.parse(successAddresses) : [];
            
            // Check if this address already exists
            const existingIndex = addressList.findIndex(addr => addr.address === traderAddress);
            
            // Create new address entry
            const newAddress = {
                address: traderAddress,
                amount: amount,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            };
            
            if (existingIndex !== -1) {
                // Update existing address with new amount and timestamp
                addressList[existingIndex] = newAddress;
                console.log('Updated existing address:', traderAddress);
            } else {
                // Add new address to the beginning of the list
                addressList.unshift(newAddress);
                console.log('Added new address:', traderAddress);
            }
            
            // Keep only the latest 5 addresses (but don't delete if it's the same address)
            if (addressList.length > 5) {
                // Remove duplicates first
                const uniqueAddresses = [];
                const seenAddresses = new Set();
                
                for (const addr of addressList) {
                    if (!seenAddresses.has(addr.address)) {
                        uniqueAddresses.push(addr);
                        seenAddresses.add(addr.address);
                    }
                }
                
                // Keep only the latest 5 unique addresses
                addressList = uniqueAddresses.slice(0, 5);
            }
            
            // Save to localStorage with sync
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinSuccessAddresses', addressList);
            } else {
                localStorage.setItem('memeCoinSuccessAddresses', JSON.stringify(addressList));
            }
            
            // Update the UI
            this.updateSuccessAddressesList();
            
            console.log('Success address list updated:', {
                totalAddresses: addressList.length,
                addresses: addressList.map(addr => addr.address)
            });
            
        } catch (error) {
            console.error('Failed to add successful address:', error);
        }
    }

    updateSuccessAddressesList() {
        try {
            const successAddresses = localStorage.getItem('memeCoinSuccessAddresses');
            const addressList = successAddresses ? JSON.parse(successAddresses) : [];
            const container = document.getElementById('successAddresses');
            
            if (!container) return;
            
            if (addressList.length === 0) {
                container.innerHTML = '<li class="address-item">Waiting for large buys...</li>';
                return;
            }
            
            container.innerHTML = addressList.map(addr => `
                <li class="address-item success" onclick="copyAddress('${addr.address}')">
                    <div class="address-text">${addr.address}</div>
                    <div class="timestamp">${addr.date} ${addr.time} - ${addr.amount} tokens</div>
                </li>
            `).join('');
            
        } catch (error) {
            console.error('Failed to update success addresses list:', error);
        }
    }

    showLargeTransactionNotification(notificationData) {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.className = 'large-transaction-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🚨</div>
                <div class="notification-text">
                    <div class="notification-title">LARGE TRANSACTION DETECTED!</div>
                    <div class="notification-details">
                        ${notificationData.transaction.type.toUpperCase()} of ${notificationData.transaction.amount} tokens
                        <br>by ${notificationData.transaction.trader}
                    </div>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    extractTokenAmount(tx) {
        try {
            if (tx.meta && tx.meta.postTokenBalances && tx.meta.preTokenBalances) {
                const lpAddress = 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh';
                
                // First try to get amount from LP balance changes
                const lpPreBalance = tx.meta.preTokenBalances.find(b => b.owner === lpAddress);
                const lpPostBalance = tx.meta.postTokenBalances.find(b => b.owner === lpAddress);
                
                if (lpPreBalance && lpPostBalance) {
                    const preAmount = lpPreBalance.uiTokenAmount.uiAmount || 0;
                    const postAmount = lpPostBalance.uiTokenAmount.uiAmount || 0;
                    const lpChange = Math.abs(postAmount - preAmount);
                    
                    console.log('LP balance analysis:', {
                        lpAddress,
                        preAmount,
                        postAmount,
                        lpChange,
                        hasPreBalance: !!lpPreBalance,
                        hasPostBalance: !!lpPostBalance
                    });
                    
                    if (lpChange > 0) {
                        return lpChange.toFixed(2);
                    }
                }
                
                // Fallback: calculate from token balance changes
                const tokenPreBalance = tx.meta.preTokenBalances.find(b => b.mint === this.tokenAddress);
                const tokenPostBalance = tx.meta.postTokenBalances.find(b => b.mint === this.tokenAddress);
                
                if (tokenPreBalance && tokenPostBalance) {
                    const preAmount = tokenPreBalance.uiTokenAmount.uiAmount || 0;
                    const postAmount = tokenPostBalance.uiTokenAmount.uiAmount || 0;
                    const tokenChange = Math.abs(postAmount - preAmount);
                    
                    if (tokenChange > 0) {
                        return tokenChange.toFixed(2);
                    }
                }
                
                // Last resort: calculate total change
                let totalChange = 0;
                for (const post of tx.meta.postTokenBalances) {
                    const pre = tx.meta.preTokenBalances.find(b => b.accountIndex === post.accountIndex);
                    if (pre) {
                        const change = Math.abs((post.uiTokenAmount.uiAmount || 0) - (pre.uiTokenAmount.uiAmount || 0));
                        totalChange += change;
                    }
                }
                
                return totalChange > 0 ? totalChange.toFixed(2) : 'Unknown';
            }
            return 'Unknown';
        } catch (error) {
            console.error('Error extracting token amount:', error);
            return 'Error';
        }
    }

    determineTransactionType(tx) {
        try {
            // Check if this is a swap transaction involving the LP
            const lpAddress = 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh';
            
            if (tx.meta && tx.meta.postTokenBalances && tx.meta.preTokenBalances) {
                // Find LP balance changes
                const lpPreBalance = tx.meta.preTokenBalances.find(b => b.owner === lpAddress);
                const lpPostBalance = tx.meta.postTokenBalances.find(b => b.owner === lpAddress);
                
                if (lpPreBalance && lpPostBalance) {
                    const preAmount = lpPreBalance.uiTokenAmount.uiAmount || 0;
                    const postAmount = lpPostBalance.uiTokenAmount.uiAmount || 0;
                    const lpChange = postAmount - preAmount;
                    
                    console.log('Transaction type analysis:', {
                        lpAddress,
                        preAmount,
                        postAmount,
                        lpChange,
                        hasPreBalance: !!lpPreBalance,
                        hasPostBalance: !!lpPostBalance
                    });
                    
                    // If LP balance increased, it's a sell (tokens sold to LP)
                    if (lpChange > 0) {
                        console.log('Transaction type determined: Sell');
                        return 'Sell';
                    }
                    // If LP balance decreased, it's a buy (tokens bought from LP)
                    else if (lpChange < 0) {
                        console.log('Transaction type determined: Buy');
                        return 'Buy';
                    }
                }
                
                // Fallback: check token balance changes for the token address
                const tokenPreBalance = tx.meta.preTokenBalances.find(b => b.mint === this.tokenAddress);
                const tokenPostBalance = tx.meta.postTokenBalances.find(b => b.mint === this.tokenAddress);
                
                if (tokenPreBalance && tokenPostBalance) {
                    const preAmount = tokenPreBalance.uiTokenAmount.uiAmount || 0;
                    const postAmount = tokenPostBalance.uiTokenAmount.uiAmount || 0;
                    const tokenChange = postAmount - preAmount;
                    
                    if (tokenChange > 0) {
                        return 'Buy';
                    } else if (tokenChange < 0) {
                        return 'Sell';
                    }
                }
                
                // Check account count changes as fallback
                const preCount = tx.meta.preTokenBalances.length;
                const postCount = tx.meta.postTokenBalances.length;
                
                if (postCount > preCount) {
                    return 'Buy';
                } else if (postCount < preCount) {
                    return 'Sell';
                }
            }
            
            return 'Transfer';
        } catch (error) {
            console.error('Error determining transaction type:', error);
            return 'Unknown';
        }
    }

    extractTraderAddress(tx) {
        try {
            const lpAddress = 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh';
            
            // Method 1: Try to find trader from token balance changes
            if (tx.meta && tx.meta.postTokenBalances && tx.meta.preTokenBalances) {
                const allAccounts = new Set();
                
                // Collect all accounts from pre and post balances
                tx.meta.preTokenBalances.forEach(balance => {
                    if (balance.owner && balance.owner !== lpAddress) {
                        allAccounts.add(balance.owner);
                    }
                });
                
                tx.meta.postTokenBalances.forEach(balance => {
                    if (balance.owner && balance.owner !== lpAddress) {
                        allAccounts.add(balance.owner);
                    }
                });
                
                // Find the account with the largest balance change (likely the trader)
                let traderAddress = null;
                let maxChange = 0;
                
                for (const account of allAccounts) {
                    const preBalance = tx.meta.preTokenBalances.find(b => b.owner === account);
                    const postBalance = tx.meta.postTokenBalances.find(b => b.owner === account);
                    
                    if (preBalance && postBalance) {
                        const preAmount = preBalance.uiTokenAmount.uiAmount || 0;
                        const postAmount = postBalance.uiTokenAmount.uiAmount || 0;
                        const change = Math.abs(postAmount - preAmount);
                        
                        if (change > maxChange) {
                            maxChange = change;
                            traderAddress = account;
                        }
                    }
                }
                
                if (traderAddress) {
                    console.log(`Found trader address from balance changes: ${traderAddress}`);
                    return traderAddress.slice(0, 8) + '...' + traderAddress.slice(-8);
                }
            }
            
            // Method 2: Try to find from account keys (excluding LP)
            if (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys && Array.isArray(tx.transaction.message.accountKeys)) {
                const accountKeys = tx.transaction.message.accountKeys;
                for (const key of accountKeys) {
                    const address = key.toString();
                    if (address !== lpAddress) {
                        console.log(`Found trader address from account keys: ${address}`);
                        return address.slice(0, 8) + '...' + address.slice(-8);
                    }
                }
            }
            
            // Method 3: Try to find from writable accounts
            if (tx.transaction && tx.transaction.message && tx.transaction.message.header && tx.transaction.message.accountKeys) {
                const header = tx.transaction.message.header;
                const accountKeys = tx.transaction.message.accountKeys;
                
                // Look for writable accounts that are not the LP
                for (let i = 0; i < accountKeys.length; i++) {
                    const address = accountKeys[i].toString();
                    if (address !== lpAddress) {
                        // Check if this account is writable
                        if (i < header.numRequiredSignatures || 
                            (i >= header.numRequiredSignatures && i < header.numRequiredSignatures + header.numReadonlySignedAccounts) ||
                            (i >= header.numRequiredSignatures + header.numReadonlySignedAccounts && 
                             i < header.numRequiredSignatures + header.numReadonlySignedAccounts + header.numReadonlyUnsignedAccounts)) {
                            console.log(`Found trader address from writable accounts: ${address}`);
                            return address.slice(0, 8) + '...' + address.slice(-8);
                        }
                    }
                }
            }
            
            // Method 4: Try to find from recent blockhash (fee payer)
            if (tx.transaction && tx.transaction.message && tx.transaction.message.recentBlockhash) {
                // The first account is usually the fee payer
                if (tx.transaction.message.accountKeys && tx.transaction.message.accountKeys.length > 0) {
                    const feePayer = tx.transaction.message.accountKeys[0].toString();
                    if (feePayer !== lpAddress) {
                        console.log(`Found trader address from fee payer: ${feePayer}`);
                        return feePayer.slice(0, 8) + '...' + feePayer.slice(-8);
                    }
                }
            }
            
            // Method 5: Try to find from any account that's not the LP
            if (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys && Array.isArray(tx.transaction.message.accountKeys)) {
                const accountKeys = tx.transaction.message.accountKeys;
                for (const key of accountKeys) {
                    const address = key.toString();
                    if (address !== lpAddress && address.length > 30) { // Basic validation
                        console.log(`Found trader address from any account: ${address}`);
                        return address.slice(0, 8) + '...' + address.slice(-8);
                    }
                }
            }
            
            console.warn('Could not extract trader address from transaction:', tx);
            return 'Unknown';
        } catch (error) {
            console.error('Error extracting trader address:', error);
            return 'Unknown';
        }
    }
    
    extractFullTraderAddress(tx) {
        try {
            const lpAddress = 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh';
            
            // Method 1: Try to find trader from token balance changes
            if (tx.meta && tx.meta.postTokenBalances && tx.meta.preTokenBalances) {
                const allAccounts = new Set();
                
                // Collect all accounts from pre and post balances
                tx.meta.preTokenBalances.forEach(balance => {
                    if (balance.owner && balance.owner !== lpAddress) {
                        allAccounts.add(balance.owner);
                    }
                });
                
                tx.meta.postTokenBalances.forEach(balance => {
                    if (balance.owner && balance.owner !== lpAddress) {
                        allAccounts.add(balance.owner);
                    }
                });
                
                // Find the account with the largest balance change (likely the trader)
                let traderAddress = null;
                let maxChange = 0;
                
                for (const account of allAccounts) {
                    const preBalance = tx.meta.preTokenBalances.find(b => b.owner === account);
                    const postBalance = tx.meta.postTokenBalances.find(b => b.owner === account);
                    
                    if (preBalance && postBalance) {
                        const preAmount = preBalance.uiTokenAmount.uiAmount || 0;
                        const postAmount = postBalance.uiTokenAmount.uiAmount || 0;
                        const change = Math.abs(postAmount - preAmount);
                        
                        if (change > maxChange) {
                            maxChange = change;
                            traderAddress = account;
                        }
                    }
                }
                
                if (traderAddress) {
                    console.log(`Found full trader address from balance changes: ${traderAddress}`);
                    return traderAddress;
                }
            }
            
            // Method 2: Try to find from account keys (excluding LP)
            if (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys && Array.isArray(tx.transaction.message.accountKeys)) {
                const accountKeys = tx.transaction.message.accountKeys;
                for (const key of accountKeys) {
                    const address = key.toString();
                    if (address !== lpAddress) {
                        console.log(`Found full trader address from account keys: ${address}`);
                        return address;
                    }
                }
            }
            
            // Method 3: Try to find from writable accounts
            if (tx.transaction && tx.transaction.message && tx.transaction.message.header && tx.transaction.message.accountKeys) {
                const header = tx.transaction.message.header;
                const accountKeys = tx.transaction.message.accountKeys;
                
                // Look for writable accounts that are not the LP
                for (let i = 0; i < accountKeys.length; i++) {
                    const address = accountKeys[i].toString();
                    if (address !== lpAddress) {
                        // Check if this account is writable
                        if (i < header.numRequiredSignatures || 
                            (i >= header.numRequiredSignatures && i < header.numRequiredSignatures + header.numReadonlySignedAccounts) ||
                            (i >= header.numRequiredSignatures + header.numReadonlySignedAccounts && 
                             i < header.numRequiredSignatures + header.numReadonlySignedAccounts + header.numReadonlyUnsignedAccounts)) {
                            console.log(`Found full trader address from writable accounts: ${address}`);
                            return address;
                        }
                    }
                }
            }
            
            // Method 4: Try to find from recent blockhash (fee payer)
            if (tx.transaction && tx.transaction.message && tx.transaction.message.recentBlockhash) {
                // The first account is usually the fee payer
                if (tx.transaction.message.accountKeys && tx.transaction.message.accountKeys.length > 0) {
                    const feePayer = tx.transaction.message.accountKeys[0].toString();
                    if (feePayer !== lpAddress) {
                        console.log(`Found full trader address from fee payer: ${feePayer}`);
                        return feePayer;
                    }
                }
            }
            
            // Method 5: Try to find from any account that's not the LP
            if (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys) {
                const accountKeys = tx.transaction.message.accountKeys;
                for (const key of accountKeys) {
                    const address = key.toString();
                    if (address !== lpAddress && address.length > 30) { // Basic validation
                        console.log(`Found full trader address from any account: ${address}`);
                        return address;
                    }
                }
            }
            
            console.warn('Could not extract full trader address from transaction:', tx);
            return 'Unknown';
        } catch (error) {
            console.error('Error extracting full trader address:', error);
            return 'Unknown';
        }
    }

    checkDetectionControl() {
        const detectionConfig = localStorage.getItem('memeCoinDetection');
        if (detectionConfig) {
            try {
                const config = JSON.parse(detectionConfig);
                if (config.isRunning && config.rpcUrl && config.tokenAddress) {
                    if (!this.isTracking) {
                        this.connect(config.rpcUrl).then(connected => {
                            if (connected) {
                                this.startTracking(config.tokenAddress);
                            }
                        });
                    }
                } else {
                    if (this.isTracking) {
                        this.stopTracking();
                    }
                }
            } catch (error) {
                console.error('Failed to parse detection configuration:', error);
            }
        } else {
            if (this.isTracking) {
                this.stopTracking();
            }
        }
    }

    // UI Update Methods
    updateConnectionStatus(status, text) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const statusMap = {
                'connected': '🟢',
                'error': '🔴',
                'connecting': '🟡'
            };
            statusElement.innerHTML = `${statusMap[status] || '⚪'} ${text}`;
        }
    }

    updateDetectionStatus(status, text) {
        const statusElement = document.getElementById('detectionStatus');
        const syncIndicator = document.querySelector('.sync-indicator');
        
        if (statusElement) {
            const statusMap = {
                'running': '🟢',
                'stopped': '🔴',
                'error': '🔴'
            };
            statusElement.innerHTML = `${statusMap[status] || '⚪'} ${text}`;
        }
        
        // Update sync indicator animation
        if (syncIndicator) {
            if (status === 'running') {
                syncIndicator.classList.add('active');
            } else {
                syncIndicator.classList.remove('active');
            }
        }
    }

    updateCurrentTokenAddress(address) {
        const addressElement = document.getElementById('currentTokenAddress');
        if (addressElement) {
            addressElement.textContent = address.slice(0, 8) + '...' + address.slice(-8);
        }
    }

    updateLastUpdate() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = new Date().toLocaleTimeString();
        }
        
        // Add a brief highlight effect to show real-time updates
        this.highlightNewTransactions();
    }
    
    highlightNewTransactions() {
        const tableBody = document.getElementById('transactionTableBody');
        if (tableBody && tableBody.children.length > 0) {
            const firstRow = tableBody.children[0];
            if (firstRow) {
                firstRow.style.backgroundColor = '#374151';
                setTimeout(() => {
                    firstRow.style.backgroundColor = '';
                }, 1000);
            }
        }
    }

    updateTransactionStats() {
        const statsElement = document.getElementById('transactionStats');
        const logElement = document.getElementById('transactionLog');
        const totalTransactionsElement = document.getElementById('totalTransactions');
        
        if (statsElement) {
            const total = this.transactions.length;
            const successful = this.transactions.filter(tx => tx.status === 'Success').length;
            const failed = total - successful;
            
            statsElement.innerHTML = `
                <div>Total: ${total}</div>
                <div>Success: ${successful}</div>
                <div>Failed: ${failed}</div>
            `;
        }
        
        if (totalTransactionsElement) {
            totalTransactionsElement.textContent = this.transactions.length;
        }
        
        if (logElement) {
            if (this.transactions.length === 0) {
                logElement.innerHTML = '<div class="log-placeholder">Waiting for detected transactions...</div>';
            } else {
                const recentLogs = this.transactions.slice(0, 20).map(tx => {
                    // Use real transaction time if available
                    const displayTime = tx.realTransactionTime ? 
                        new Date(tx.realTransactionTime).toLocaleTimeString() : 
                        new Date(tx.timestamp).toLocaleTimeString();
                    
                    return `
                        <div class="log-entry">
                            <span class="log-time">${displayTime}</span>
                            <span class="log-type ${tx.type.toLowerCase()}">${tx.type}</span>
                            <span class="log-amount">${tx.amount}</span>
                            <span class="log-trader">${tx.trader}</span>
                        </div>
                    `;
                }).join('');
                logElement.innerHTML = recentLogs;
            }
        }
    }

    updateTransactionList() {
        const tableBody = document.getElementById('transactionTableBody');
        const recordCount = document.getElementById('recordCount');
        const syncStatus = document.querySelector('.sync-status');
        
        if (tableBody) {
            if (this.transactions.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="no-records">No transaction records yet</td></tr>';
            } else {
                // Show all transactions (up to 100)
                const displayTransactions = this.transactions.slice(0, 100);
                tableBody.innerHTML = displayTransactions.map((tx, index) => {
                    // Use real transaction time if available, otherwise fallback to timestamp
                    const displayTime = tx.realTransactionTime ? 
                        new Date(tx.realTransactionTime).toLocaleTimeString() : 
                        new Date(tx.timestamp).toLocaleTimeString();
                    
                    return `
                        <tr>
                            <td>${displayTime}</td>
                            <td><span class="tx-type ${tx.type.toLowerCase()}">${tx.type}</span></td>
                            <td>${tx.amount}</td>
                            <td>
                                <span class="trader-address" title="Click to copy full address" onclick="copyAddress('${tx.fullTraderAddress || tx.trader}')">
                                    ${tx.trader}
                                </span>
                            </td>
                            <td>
                                <span class="tx-signature" title="Click to copy full signature" onclick="copySignature('${tx.signature}')">
                                    ${tx.signature.slice(0, 8)}...
                                </span>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
        
        if (recordCount) {
            recordCount.textContent = `${this.transactions.length} records (max 100)`;
        }
        
        if (syncStatus) {
            syncStatus.textContent = this.isTracking ? 'Syncing...' : 'Waiting for sync...';
        }
    }

    start() {
        // Start transaction tracking if conditions are met
        this.checkDetectionControl();
    }

    destroy() {
        this.stopTracking();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TransactionTracker };
} else {
    // Browser environment - expose to global scope
    window.TransactionTracker = TransactionTracker;
} 