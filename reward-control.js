/**
 * 奖励控制面板 JavaScript
 * 提供100,000积分奖励的完整控制功能
 */

class RewardControlPanel {
    constructor() {
        this.firebaseApp = null;
        this.database = null;
        this.backendManager = null;
        this.isInitialized = false;
    }

    // 初始化控制面板
    async init() {
        try {
            await this.initializeFirebase();
            this.initializeBackendManager();
            this.isInitialized = true;
            this.logOperation('奖励控制面板初始化成功');
            return true;
        } catch (error) {
            this.logOperation('奖励控制面板初始化失败: ' + error.message, 'error');
            return false;
        }
    }

    // 初始化 Firebase
    async initializeFirebase() {
        try {
            // 检查是否已经初始化
            if (this.firebaseApp) {
                return;
            }

            // 使用实际的 Firebase 配置
            const firebaseConfig = {
                apiKey: "AIzaSyA5Z5ieEbAcfQX0kxGSn9ldGXhzvAwx_8M",
                authDomain: "chat-294cc.firebaseapp.com",
                databaseURL: "https://chat-294cc-default-rtdb.firebaseio.com",
                projectId: "chat-294cc",
                storageBucket: "chat-294cc.firebasestorage.app",
                messagingSenderId: "913615304269",
                appId: "1:913615304269:web:0274ffaccb8e6b678e4e04",
                measurementId: "G-SJR9NDW86B"
            };

            this.firebaseApp = firebase.initializeApp(firebaseConfig);
            this.database = firebase.database();
            this.logOperation('Firebase 初始化成功');
        } catch (error) {
            throw new Error('Firebase 初始化失败: ' + error.message);
        }
    }

    // 初始化 BackendManager
    initializeBackendManager() {
        try {
            if (!window.BackendManager) {
                throw new Error('BackendManager 未加载');
            }
            this.backendManager = new BackendManager();
            this.logOperation('BackendManager 初始化成功');
        } catch (error) {
            throw new Error('BackendManager 初始化失败: ' + error.message);
        }
    }

    // 检查 Firebase 连接状态
    async checkFirebaseConnection() {
        if (!this.database) {
            return { connected: false, message: 'Firebase 未初始化' };
        }

        try {
            // 使用 Firebase v9 语法
            const connectedRef = this.database.ref('.info/connected');
            
            // 等待连接状态
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    resolve({ connected: false, message: '连接超时' });
                }, 5000); // 5秒超时
                
                connectedRef.once('value').then((snapshot) => {
                    clearTimeout(timeout);
                    const isConnected = snapshot.val();
                    
                    if (isConnected) {
                        this.logOperation('Firebase 连接检查成功');
                        resolve({ connected: true, message: '已连接' });
                    } else {
                        this.logOperation('Firebase 连接检查失败', 'error');
                        resolve({ connected: false, message: '连接失败' });
                    }
                }).catch((error) => {
                    clearTimeout(timeout);
                    this.logOperation('Firebase 连接错误: ' + error.message, 'error');
                    resolve({ connected: false, message: '连接错误: ' + error.message });
                });
            });
        } catch (error) {
            this.logOperation('Firebase 连接错误: ' + error.message, 'error');
            return { connected: false, message: '连接错误: ' + error.message };
        }
    }

    // 设置获奖地址
    async setWinnerAddress(address, amount = 100000) {
        if (!this.isInitialized) {
            throw new Error('控制面板未初始化');
        }

        if (!this.isValidSolanaAddress(address)) {
            throw new Error('无效的 Solana 地址格式');
        }

        if (amount <= 0 || amount > 1000000) {
            throw new Error('奖励积分数量必须在 1-1,000,000 之间');
        }

        try {
            // 使用 BackendManager 设置地址
            const success = this.backendManager.setMainCountdownRewardAddress(address);
            if (!success) {
                throw new Error('BackendManager 设置失败');
            }

            // 创建奖励数据
            const rewardData = {
                address: address,
                amount: amount,
                isSet: true,
                lastUpdate: new Date().toISOString()
            };

            // 保存到 localStorage
            localStorage.setItem('mainCountdownRewardAddress', JSON.stringify(rewardData));

            // 同步到 Firebase
            if (this.database) {
                await this.database.ref('mainCountdownRewards').set(rewardData);
            }

            // 创建奖励记录
            await this.createRewardRecord(address, amount);

            this.logOperation(`设置获奖地址成功: ${address}, 奖励积分: ${amount}`);
            return { success: true, data: rewardData };
        } catch (error) {
            this.logOperation('设置获奖地址失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 清除获奖地址
    async clearWinnerAddress() {
        if (!this.isInitialized) {
            throw new Error('控制面板未初始化');
        }

        try {
            const success = this.backendManager.clearMainCountdownRewardAddress();
            if (!success) {
                throw new Error('BackendManager 清除失败');
            }

            // 清除 localStorage
            localStorage.removeItem('mainCountdownRewardAddress');

            // 清除 Firebase
            if (this.database) {
                await this.database.ref('mainCountdownRewards').remove();
            }

            this.logOperation('获奖地址已清除');
            return { success: true };
        } catch (error) {
            this.logOperation('清除获奖地址失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 获取当前获奖地址
    getCurrentWinnerAddress() {
        if (!this.isInitialized) {
            throw new Error('控制面板未初始化');
        }

        try {
            const rewardData = this.backendManager.getMainCountdownRewardAddress();
            return rewardData;
        } catch (error) {
            this.logOperation('获取获奖地址失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 创建奖励记录
    async createRewardRecord(address, amount) {
        try {
            const rewardData = {
                id: `main_countdown_reward_${Date.now()}`,
                type: 'main-countdown',
                round: 1,
                amount: amount,
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

            // 保存到 localStorage
            const existingRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            existingRewards.push(rewardData);
            localStorage.setItem('mainCountdownRewards', JSON.stringify(existingRewards));

            // 保存到 Firebase
            if (this.database) {
                await this.database.ref('mainCountdownRewards').push(rewardData);
            }

            this.logOperation(`创建奖励记录成功: ${address}`);
            return rewardData;
        } catch (error) {
            this.logOperation('创建奖励记录失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 获取所有奖励记录
    getAllRewards() {
        try {
            const rewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            return rewards;
        } catch (error) {
            this.logOperation('获取奖励记录失败: ' + error.message, 'error');
            return [];
        }
    }

    // 获取已领取的奖励
    getClaimedRewards() {
        try {
            const rewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            return rewards.filter(reward => reward.claimed);
        } catch (error) {
            this.logOperation('获取已领取奖励失败: ' + error.message, 'error');
            return [];
        }
    }

    // 获取待领取的奖励
    getPendingRewards() {
        try {
            const rewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            return rewards.filter(reward => !reward.claimed);
        } catch (error) {
            this.logOperation('获取待领取奖励失败: ' + error.message, 'error');
            return [];
        }
    }

    // 重置所有奖励
    async resetAllRewards() {
        if (!this.isInitialized) {
            throw new Error('控制面板未初始化');
        }

        try {
            // 清除 localStorage
            localStorage.removeItem('mainCountdownRewards');
            localStorage.removeItem('mainCountdownRewardAddress');

            // 清除 Firebase
            if (this.database) {
                await this.database.ref('mainCountdownRewards').remove();
            }

            this.logOperation('所有奖励记录已重置');
            return { success: true };
        } catch (error) {
            this.logOperation('重置奖励记录失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 导出奖励数据
    exportRewardData() {
        try {
            const rewardAddress = localStorage.getItem('mainCountdownRewardAddress');
            const rewards = localStorage.getItem('mainCountdownRewards');
            
            const exportData = {
                rewardAddress: rewardAddress ? JSON.parse(rewardAddress) : null,
                rewards: rewards ? JSON.parse(rewards) : [],
                exportTime: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `reward_data_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.logOperation('奖励数据导出成功');
            return { success: true, data: exportData };
        } catch (error) {
            this.logOperation('导出奖励数据失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 导入奖励数据
    async importRewardData(file) {
        if (!this.isInitialized) {
            throw new Error('控制面板未初始化');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (!data.version) {
                        throw new Error('无效的数据格式');
                    }
                    
                    // 导入奖励地址
                    if (data.rewardAddress) {
                        localStorage.setItem('mainCountdownRewardAddress', JSON.stringify(data.rewardAddress));
                        if (this.database) {
                            await this.database.ref('mainCountdownRewards').set(data.rewardAddress);
                        }
                    }
                    
                    // 导入奖励记录
                    if (data.rewards && Array.isArray(data.rewards)) {
                        localStorage.setItem('mainCountdownRewards', JSON.stringify(data.rewards));
                        if (this.database) {
                            await this.database.ref('mainCountdownRewards').remove();
                            for (const reward of data.rewards) {
                                await this.database.ref('mainCountdownRewards').push(reward);
                            }
                        }
                    }
                    
                    this.logOperation('奖励数据导入成功');
                    resolve({ success: true, data: data });
                } catch (error) {
                    this.logOperation('导入奖励数据失败: ' + error.message, 'error');
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    // 验证 Solana 地址
    isValidSolanaAddress(address) {
        const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return solanaAddressRegex.test(address);
    }

    // 记录操作日志
    logOperation(message, type = 'info') {
        const timestamp = new Date().toLocaleString();
        const logEntry = {
            timestamp: timestamp,
            message: message,
            type: type
        };
        
        // 保存到控制台
        console.log(`[${timestamp}] ${message}`);
        
        // 触发自定义事件，让UI更新
        const event = new CustomEvent('rewardControlLog', { detail: logEntry });
        document.dispatchEvent(event);
    }

    // 获取系统状态
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            firebaseConnected: !!this.database,
            backendManagerAvailable: !!this.backendManager,
            currentWinnerAddress: this.getCurrentWinnerAddress(),
            totalRewards: this.getAllRewards().length,
            claimedRewards: this.getClaimedRewards().length,
            pendingRewards: this.getPendingRewards().length
        };
    }
}

// 全局实例
window.rewardControlPanel = new RewardControlPanel();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RewardControlPanel };
} 