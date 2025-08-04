/**
 * Wallet Manager Module
 * Handles wallet connections for OKX, Phantom, and Coinbase wallets
 */

// Since we're using script tags, we'll access APP_CONFIG globally
const APP_CONFIG = window.APP_CONFIG || {
    SOLANA: {
        LP_ADDRESS: 'WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh',
        TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        WEB3_VERSION: '1.87.6',
        COMMITMENT: 'confirmed'
    }
};

class WalletManager {
    constructor() {
        this.connectedWallet = null;
        this.walletAddress = null;
        this.connection = null;
        this.isConnecting = false;
        
        // Wallet providers
        this.wallets = {
            okx: {
                name: 'OKX Wallet',
                icon: '🟢',
                provider: null
            },
            phantom: {
                name: 'Phantom Wallet',
                icon: '👻',
                provider: null
            },
            coinbase: {
                name: 'Coinbase Wallet',
                icon: '🟡',
                provider: null
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('Initializing WalletManager...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.checkExistingConnection();
            });
        } else {
            this.setupEventListeners();
            this.checkExistingConnection();
        }
    }
    
    setupEventListeners() {
        console.log('Setting up wallet event listeners...');
        
        // Wallet connect button
        const walletConnectBtn = document.getElementById('walletConnectBtn');
        if (walletConnectBtn) {
            console.log('Found wallet connect button, adding click listener');
            walletConnectBtn.addEventListener('click', () => {
                console.log('Wallet connect button clicked');
                this.showWalletModal();
            });
        } else {
            console.error('Wallet connect button not found!');
        }
        
        // Wallet modal close button
        const walletModalClose = document.getElementById('walletModalClose');
        if (walletModalClose) {
            walletModalClose.addEventListener('click', () => this.hideWalletModal());
        }
        
        // Wallet options
        const okxWalletBtn = document.getElementById('okxWalletBtn');
        const phantomWalletBtn = document.getElementById('phantomWalletBtn');
        const coinbaseWalletBtn = document.getElementById('coinbaseWalletBtn');
        
        if (okxWalletBtn) {
            okxWalletBtn.addEventListener('click', () => this.connectWallet('okx'));
        }
        
        if (phantomWalletBtn) {
            phantomWalletBtn.addEventListener('click', () => this.connectWallet('phantom'));
        }
        
        if (coinbaseWalletBtn) {
            coinbaseWalletBtn.addEventListener('click', () => this.connectWallet('coinbase'));
        }
        
        // Close modal when clicking outside
        const walletModal = document.getElementById('walletModal');
        if (walletModal) {
            walletModal.addEventListener('click', (e) => {
                if (e.target === walletModal) {
                    this.hideWalletModal();
                }
            });
        }
        
        // Handle wallet account changes
        window.addEventListener('load', () => {
            this.setupWalletListeners();
        });
    }
    
    setupWalletListeners() {
        // Listen for account changes in Phantom
        if (window.solana && window.solana.isPhantom) {
            window.solana.on('accountChanged', (publicKey) => {
                if (publicKey) {
                    this.handleAccountChange(publicKey.toString());
                } else {
                    this.handleDisconnect();
                }
            });
        }
        
        // Listen for account changes in OKX
        if (window.okxwallet) {
            window.okxwallet.on('accountChanged', (publicKey) => {
                if (publicKey) {
                    this.handleAccountChange(publicKey.toString());
                } else {
                    this.handleDisconnect();
                }
            });
        }
        
        // Listen for account changes in Coinbase
        if (window.coinbaseWalletExtension) {
            window.coinbaseWalletExtension.on('accountChanged', (publicKey) => {
                if (publicKey) {
                    this.handleAccountChange(publicKey.toString());
                } else {
                    this.handleDisconnect();
                }
            });
        }
    }
    
    showWalletModal() {
        const walletModal = document.getElementById('walletModal');
        if (walletModal) {
            walletModal.classList.add('show');
        }
    }
    
    hideWalletModal() {
        const walletModal = document.getElementById('walletModal');
        if (walletModal) {
            walletModal.classList.remove('show');
        }
    }
    
    async connectWallet(walletType) {
        if (this.isConnecting) return;
        
        this.isConnecting = true;
        this.updateWalletStatus('Connecting...');
        
        try {
            let provider = null;
            let publicKey = null;
            
            switch (walletType) {
                case 'okx':
                    provider = await this.connectOKXWallet();
                    break;
                case 'phantom':
                    provider = await this.connectPhantomWallet();
                    break;
                case 'coinbase':
                    provider = await this.connectCoinbaseWallet();
                    break;
                default:
                    throw new Error('Unsupported wallet type');
            }
            
            if (provider) {
                this.connectedWallet = walletType;
                this.wallets[walletType].provider = provider;
                
                // Get wallet address based on wallet type
                if (walletType === 'phantom') {
                    // Phantom uses Solana's connection method
                    publicKey = provider.publicKey;
                    if (publicKey) {
                        this.walletAddress = publicKey.toString();
                    }
                } else if (walletType === 'okx') {
                    // OKX wallet - check if we have Solana provider
                    if (provider.publicKey) {
                        // Solana provider
                        this.walletAddress = provider.publicKey.toString();
                    } else {
                        // Try to get Solana accounts
                        try {
                            const accounts = await provider.request({ method: 'sol_accounts' });
                            if (accounts && accounts[0]) {
                                this.walletAddress = accounts[0];
                            }
                        } catch (error) {
                            // Fallback to Ethereum accounts
                            const accounts = await provider.request({ method: 'eth_accounts' });
                            if (accounts && accounts[0]) {
                                this.walletAddress = accounts[0];
                            }
                        }
                    }
                } else {
                    // Coinbase uses Ethereum-style methods
                    const accounts = await provider.request({ method: 'eth_accounts' });
                    if (accounts && accounts[0]) {
                        this.walletAddress = accounts[0];
                    }
                }
                
                if (this.walletAddress) {
                    this.updateWalletStatus(`Connected: ${this.formatAddress(this.walletAddress)}`);
                    this.hideWalletModal();
                    
                    // Store connection info
                    this.saveWalletConnection(walletType, this.walletAddress);
                    
                    console.log(`Successfully connected to ${this.wallets[walletType].name}`);
                } else {
                    throw new Error('Failed to get wallet address');
                }
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.updateWalletStatus('Connection failed');
            this.showError(`Failed to connect to ${this.wallets[walletType].name}: ${error.message}`);
        } finally {
            this.isConnecting = false;
        }
    }
    
    async connectOKXWallet() {
        if (!window.okxwallet) {
            throw new Error('OKX Wallet extension not found. Please install OKX Wallet.');
        }
        
        try {
            // For OKX wallet, we need to connect to Solana specifically
            // OKX wallet supports both Ethereum and Solana, so we need to specify Solana
            if (window.okxwallet.solana) {
                // Use Solana provider directly
                const response = await window.okxwallet.solana.connect();
                console.log('OKX Solana connection successful:', response);
                return window.okxwallet.solana;
            } else {
                // Fallback: try to request Solana accounts
                const accounts = await window.okxwallet.request({ 
                    method: 'sol_requestAccounts' 
                });
                console.log('OKX Solana accounts:', accounts);
                return window.okxwallet;
            }
        } catch (error) {
            console.error('OKX Solana connection failed:', error);
            
            // If Solana connection fails, try Ethereum method as fallback
            try {
                await window.okxwallet.request({ method: 'eth_requestAccounts' });
                console.log('OKX Ethereum connection successful (fallback)');
                return window.okxwallet;
            } catch (ethError) {
                throw new Error(`Failed to connect OKX wallet to Solana network. Please ensure OKX wallet is installed and Solana network is enabled. Error: ${error.message}`);
            }
        }
    }
    
    async connectPhantomWallet() {
        if (!window.solana || !window.solana.isPhantom) {
            throw new Error('Phantom Wallet extension not found. Please install Phantom Wallet.');
        }
        
        // Request connection
        const response = await window.solana.connect();
        
        // Ensure we're on Solana mainnet
        try {
            await window.solana.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x65' }], // Solana mainnet
            });
        } catch (error) {
            // If the chain doesn't exist, add it
            if (error.code === 4902) {
                await window.solana.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x65',
                        chainName: 'Solana',
                        nativeCurrency: {
                            name: 'SOL',
                            symbol: 'SOL',
                            decimals: 9
                        },
                        rpcUrls: ['https://api.mainnet-beta.solana.com'],
                        blockExplorerUrls: ['https://explorer.solana.com']
                    }]
                });
            }
        }
        
        return window.solana;
    }
    
    async connectCoinbaseWallet() {
        if (!window.coinbaseWalletExtension) {
            throw new Error('Coinbase Wallet extension not found. Please install Coinbase Wallet.');
        }
        
        // Request connection
        await window.coinbaseWalletExtension.request({ method: 'eth_requestAccounts' });
        
        // Switch to Solana network
        try {
            await window.coinbaseWalletExtension.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x65', // Solana mainnet
                    chainName: 'Solana',
                    nativeCurrency: {
                        name: 'SOL',
                        symbol: 'SOL',
                        decimals: 9
                    },
                    rpcUrls: ['https://api.mainnet-beta.solana.com'],
                    blockExplorerUrls: ['https://explorer.solana.com']
                }]
            });
        } catch (error) {
            // Chain might already be added
            console.log('Chain already exists or user rejected');
        }
        
        return window.coinbaseWalletExtension;
    }
    
    async disconnectWallet() {
        if (this.connectedWallet && this.wallets[this.connectedWallet].provider) {
            try {
                await this.wallets[this.connectedWallet].provider.disconnect();
            } catch (error) {
                console.log('Disconnect error:', error);
            }
        }
        
        this.connectedWallet = null;
        this.walletAddress = null;
        this.updateWalletStatus('Not connected');
        this.clearWalletConnection();
        
        console.log('Wallet disconnected');
    }
    
    handleAccountChange(newAddress) {
        this.walletAddress = newAddress;
        this.updateWalletStatus(`Connected: ${this.formatAddress(newAddress)}`);
        this.saveWalletConnection(this.connectedWallet, newAddress);
    }
    
    handleDisconnect() {
        this.connectedWallet = null;
        this.walletAddress = null;
        this.updateWalletStatus('Not connected');
        this.clearWalletConnection();
    }
    
    checkExistingConnection() {
        const savedConnection = this.getSavedWalletConnection();
        if (savedConnection) {
            this.connectedWallet = savedConnection.type;
            this.walletAddress = savedConnection.address;
            this.updateWalletStatus(`Connected: ${this.formatAddress(savedConnection.address)}`);
        }
    }
    
    updateWalletStatus(status) {
        const walletStatusText = document.getElementById('walletStatusText');
        if (walletStatusText) {
            walletStatusText.textContent = status;
        }
        
        const walletConnectBtn = document.getElementById('walletConnectBtn');
        if (walletConnectBtn) {
            const span = walletConnectBtn.querySelector('span');
            if (span) {
                if (status.includes('Connected')) {
                    span.textContent = '🔗 Wallet Connected';
                    walletConnectBtn.style.backgroundColor = '#10b981';
                } else if (status.includes('Connecting')) {
                    span.textContent = '⏳ Connecting...';
                    walletConnectBtn.style.backgroundColor = '#f59e0b';
                } else if (status.includes('failed')) {
                    span.textContent = '🔗 Connect Wallet';
                    walletConnectBtn.style.backgroundColor = '#ef4444';
                } else {
                    span.textContent = '🔗 Connect Wallet';
                    walletConnectBtn.style.backgroundColor = '';
                }
            }
        }
    }
    
    formatAddress(address) {
        if (!address) return 'Unknown';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    showError(message) {
        // Create a temporary error notification
        const notification = document.createElement('div');
        notification.className = 'wallet-error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10001;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    saveWalletConnection(type, address) {
        const connectionData = {
            type,
            address,
            timestamp: Date.now()
        };
        
        localStorage.setItem('walletConnection', JSON.stringify(connectionData));
        
        // Send message to claim reward page if it's open
        window.postMessage({
            type: 'walletConnected',
            address: address,
            data: connectionData
        }, '*');
    }
    
    getSavedWalletConnection() {
        const saved = localStorage.getItem('walletConnection');
        return saved ? JSON.parse(saved) : null;
    }
    
    clearWalletConnection() {
        localStorage.removeItem('walletConnection');
        
        // Send message to claim reward page if it's open
        window.postMessage({
            type: 'walletDisconnected',
            address: null,
            data: null
        }, '*');
    }
    
    // Public methods for other modules
    getConnectedWallet() {
        return {
            type: this.connectedWallet,
            address: this.walletAddress,
            provider: this.connectedWallet ? this.wallets[this.connectedWallet].provider : null
        };
    }
    
    isWalletConnected() {
        return !!this.connectedWallet && !!this.walletAddress;
    }
    
    async signMessage(message) {
        if (!this.isWalletConnected()) {
            throw new Error('No wallet connected');
        }
        
        const provider = this.wallets[this.connectedWallet].provider;
        if (!provider) {
            throw new Error('Wallet provider not available');
        }
        
        try {
            const signature = await provider.request({
                method: 'personal_sign',
                params: [message, this.walletAddress]
            });
            return signature;
        } catch (error) {
            throw new Error(`Failed to sign message: ${error.message}`);
        }
    }
    
    async sendTransaction(transaction) {
        if (!this.isWalletConnected()) {
            throw new Error('No wallet connected');
        }
        
        const provider = this.wallets[this.connectedWallet].provider;
        if (!provider) {
            throw new Error('Wallet provider not available');
        }
        
        try {
            const txHash = await provider.request({
                method: 'eth_sendTransaction',
                params: [transaction]
            });
            return txHash;
        } catch (error) {
            throw new Error(`Failed to send transaction: ${error.message}`);
        }
    }
}

// Make WalletManager available globally for script tag usage
window.WalletManager = WalletManager; 