/**
 * Countdown Manager Module
 * Handles main countdown and reward countdown functionality
 */

class CountdownManager {
    constructor() {
        this.mainCountdown = null;
        this.rewardCountdown = null;
        this.syncInterval = null;
        this.init();
    }

    init() {
        this.setupMainCountdown();
        this.setupRewardCountdown();
        this.startSyncWithBackend();
    }

    // Main Countdown Management
    setupMainCountdown() {
        this.mainCountdown = new MainCountdown();
        this.mainCountdown.init();
    }

    // Reward Countdown Management
    setupRewardCountdown() {
        this.rewardCountdown = new RewardCountdown();
        this.rewardCountdown.init();
    }

    // Backend Synchronization
    startSyncWithBackend() {
        this.syncInterval = setInterval(() => {
            this.checkBackendUpdates();
        }, 1000); // Check every 1 second for more responsive updates
    }

    checkBackendUpdates() {
        try {
            // Always check for main countdown updates
            if (this.mainCountdown) {
                this.mainCountdown.updateFromBackend({});
            }
            
            // Always check for reward countdown updates
            if (this.rewardCountdown) {
                this.rewardCountdown.updateFromBackend({});
            }
        } catch (error) {
            console.error('Failed to check backend updates:', error);
        }
    }

    start() {
        // Start countdown synchronization
        this.startSyncWithBackend();
    }

    destroy() {
        if (this.mainCountdown) {
            this.mainCountdown.destroy();
        }
        if (this.rewardCountdown) {
            this.rewardCountdown.destroy();
        }
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

// Main Countdown Class
class MainCountdown {
    constructor() {
        this.minutes = 5;
        this.seconds = 0;
        this.isRunning = false;
        this.interval = null;
        this.lastUpdate = null;
    }

    init() {
        console.log('🚀 Initializing MainCountdown - waiting for database sync...');
        this.loadFromBackend();
        
        // Start countdown if we have database-synced countdown (even if expired)
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    console.log('✅ Database countdown found, starting countdown...');
                    this.start();
                } else {
                    console.log('⚠️ Database countdown expired, but starting to check for completion logic...');
                    this.start(); // Start even if expired to trigger completion logic
                }
            } catch (error) {
                console.error('Failed to parse database countdown:', error);
            }
        } else {
            console.log('⏳ No database countdown found, waiting for sync...');
        }
    }

    loadFromBackend() {
        try {
            // Always prioritize database-synced countdown
            const globalCountdown = localStorage.getItem('memeCoinCountdown');
            if (globalCountdown) {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    const remainingTime = targetDate - now;
                    this.minutes = Math.floor(remainingTime / (1000 * 60));
                    this.seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    console.log('✅ Loaded countdown from database sync:', this.minutes, this.seconds);
                } else {
                    console.log('⚠️ Database countdown has expired');
                }
            }
        } catch (error) {
            console.error('Failed to load countdown from backend:', error);
        }
    }

    saveToBackend() {
        try {
            const now = new Date();
            const targetDate = new Date(now.getTime() + (this.minutes * 60 + this.seconds) * 1000);
            
            const countdownData = {
                targetDate: targetDate.toISOString(),
                lastUpdate: now.toISOString(),
                resetBy: 'frontend',
                version: '2.0',
                activeUsers: 0
            };

            localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
            console.log('✅ Countdown saved to backend sync:', countdownData);
        } catch (error) {
            console.error('Failed to save countdown to backend:', error);
        }
    }

    start() {
        if (this.isRunning) {
            console.log('Countdown is already running');
            return;
        }

        this.isRunning = true;
        this.interval = setInterval(() => {
            this.update();
        }, 1000);
        
        console.log('🚀 Main countdown started');
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        console.log('⏹️ Main countdown stopped');
    }

    update() {
        // Always check database-synced countdown first
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                console.log('Database countdown check:', {
                    targetDate: targetDate.toISOString(),
                    now: now.toISOString(),
                    isExpired: targetDate <= now
                });
                
                if (targetDate > now) {
                    // Calculate remaining time from database
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    // If database countdown differs from current display, update display
                    if (remainingMinutes !== this.minutes || remainingSeconds !== this.seconds) {
                        this.minutes = remainingMinutes;
                        this.seconds = remainingSeconds;
                        this.updateDisplay();
                        console.log('✅ Countdown updated from database sync:', this.minutes, this.seconds);
                        return; // Don't execute local countdown logic
                    }
                } else {
                    // Database countdown has ended - show completion message
                    console.log('🎯 Database countdown ended - showing completion message...');
                    this.showLaunchMessage();
                    
                    // Clear the database countdown to prevent repeated execution
                    localStorage.removeItem('memeCoinCountdown');
                    
                    // Stop the countdown
                    this.stop();
                    
                    // Restart countdown after delay (will wait for database sync)
                    setTimeout(() => {
                        this.restart();
                    }, 3000);
                    return;
                }
            } catch (error) {
                console.error('Failed to parse database countdown:', error);
            }
        } else {
            // No database countdown available - wait for sync
            console.log('⏳ No database countdown available, waiting for sync...');
            return; // Don't execute local countdown logic
        }
        
        // Don't execute local countdown logic - only use database-synced countdown
        console.log('🔄 Waiting for database countdown sync...');
    }

    updateDisplay() {
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (minutesElement) {
            minutesElement.textContent = this.minutes.toString().padStart(2, '0');
        }
        if (secondsElement) {
            secondsElement.textContent = this.seconds.toString().padStart(2, '0');
        }
    }

    showLaunchMessage() {
        console.log('🎉 Main countdown completed!');
        
        // Show reward claim modal
        this.showRewardClaimModal();
    }

    showRewardClaimModal() {
        // Create modal for reward claim
        const modal = document.createElement('div');
        modal.className = 'reward-claim-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-in-out;
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 2px solid #475569;
                border-radius: 16px;
                padding: 2rem;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease-out;
            ">
                <h2 style="color: #f8fafc; margin-bottom: 1rem; font-size: 1.5rem;">
                    🎉 Round Complete!
                </h2>
                <p style="color: #cbd5e1; margin-bottom: 1.5rem; line-height: 1.6;">
                    The main countdown has ended. Please check the reward claim page to see if you have any rewards available.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="this.closest('.reward-claim-modal').remove()" style="
                        background: #475569;
                        color: #f8fafc;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: background 0.2s;
                    " onmouseover="this.style.background='#64748b'" onmouseout="this.style.background='#475569'">
                        Close
                    </button>
                    <button onclick="window.open('claim-reward.html', '_blank')" style="
                        background: #2563eb;
                        color: #f8fafc;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: background 0.2s;
                    " onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
                        Claim Rewards
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-remove modal after 10 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 10000);
    }

    restart() {
        console.log('🔄 Restarting main countdown...');
        
        // Only update display, don't reset countdown logic
        this.updateDisplay();
        
        // Wait for database sync
        console.log('⏳ Waiting for database countdown sync...');
    }

    updateFromBackend(backendConfig) {
        try {
            // Always prioritize database-synced countdown
            const globalCountdown = localStorage.getItem('memeCoinCountdown');
            if (globalCountdown) {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    if (remainingMinutes !== this.minutes || remainingSeconds !== this.seconds) {
                        this.minutes = remainingMinutes;
                        this.seconds = remainingSeconds;
                        this.updateDisplay();
                        console.log('✅ Countdown updated from backend sync:', this.minutes, this.seconds);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to update countdown from backend:', error);
        }
    }

    destroy() {
        this.stop();
        console.log('🗑️ MainCountdown destroyed');
    }
}

// Reward Countdown Class
class RewardCountdown {
    constructor() {
        this.minutes = 20;
        this.seconds = 0;
        this.isRunning = false;
        this.interval = null;
        this.lastUpdate = null;
    }

    init() {
        console.log('🎁 Initializing RewardCountdown...');
        this.loadFromBackend();
        this.start();
    }

    loadFromBackend() {
        try {
            const rewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
            if (rewardCountdown) {
                const data = JSON.parse(rewardCountdown);
                this.minutes = data.minutes || 20;
                this.seconds = data.seconds || 0;
                this.lastUpdate = data.lastUpdate;
                console.log('✅ Loaded reward countdown from backend:', this.minutes, this.seconds);
            }
        } catch (error) {
            console.error('Failed to load reward countdown from backend:', error);
        }
    }

    saveToBackend() {
        try {
            const countdownData = {
                minutes: this.minutes,
                seconds: this.seconds,
                lastUpdate: new Date().toISOString()
            };

            localStorage.setItem('memeCoinRewardCountdown', JSON.stringify(countdownData));
            console.log('✅ Reward countdown saved to backend:', countdownData);
        } catch (error) {
            console.error('Failed to save reward countdown to backend:', error);
        }
    }

    start() {
        if (this.isRunning) {
            console.log('Reward countdown is already running');
            return;
        }

        this.isRunning = true;
        this.interval = setInterval(() => {
            this.update();
        }, 1000);
        
        console.log('🎁 Reward countdown started');
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        console.log('⏹️ Reward countdown stopped');
    }

    update() {
        if (this.seconds > 0) {
            this.seconds--;
        } else if (this.minutes > 0) {
            this.minutes--;
            this.seconds = 59;
        } else {
            // Countdown ended
            console.log('🎁 Reward countdown ended');
            this.saveHoldersSnapshotOnRewardEnd();
            this.resetToBackend();
            this.stop();
            this.start();
        }

        this.updateDisplay();
    }

    saveHoldersSnapshotOnRewardEnd() {
        console.log('📸 Saving holders snapshot on reward countdown end...');
        // This functionality is handled by other modules
    }

    updateDisplay() {
        const rewardMinutesElement = document.getElementById('rewardMinutes');
        const rewardSecondsElement = document.getElementById('rewardSeconds');
        
        if (rewardMinutesElement) {
            rewardMinutesElement.textContent = this.minutes.toString().padStart(2, '0');
        }
        if (rewardSecondsElement) {
            rewardSecondsElement.textContent = this.seconds.toString().padStart(2, '0');
        }
    }

    resetToBackend() {
        try {
            const countdownData = {
                minutes: 20,
                seconds: 0,
                lastUpdate: new Date().toISOString()
            };

            localStorage.setItem('memeCoinRewardCountdown', JSON.stringify(countdownData));
            console.log('✅ Reward countdown reset to backend:', countdownData);
        } catch (error) {
            console.error('Failed to reset reward countdown to backend:', error);
        }
    }

    updateFromBackend(backendConfig) {
        try {
            if (backendConfig && backendConfig.rewardCountdown) {
                const data = backendConfig.rewardCountdown;
                this.minutes = data.minutes || 20;
                this.seconds = data.seconds || 0;
                this.lastUpdate = data.lastUpdate;
                this.updateDisplay();
                console.log('✅ Reward countdown updated from backend:', this.minutes, this.seconds);
            }
        } catch (error) {
            console.error('Failed to update reward countdown from backend:', error);
        }
    }

    destroy() {
        this.stop();
        console.log('🗑️ RewardCountdown destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CountdownManager, MainCountdown, RewardCountdown };
} else {
    // Browser environment - expose to global scope
    window.CountdownManager = CountdownManager;
    window.MainCountdown = MainCountdown;
    window.RewardCountdown = RewardCountdown;
} 