// 测试奖励流程的脚本
console.log('🔍 开始测试奖励流程...');

// 1. 检查 BackendManager 是否可用
if (typeof BackendManager !== 'undefined') {
    console.log('✅ BackendManager 已加载');
    
    // 初始化 BackendManager
    if (!window.backendManager) {
        window.backendManager = new BackendManager();
        window.backendManager.init();
        console.log('✅ BackendManager 已初始化');
    }
    
    // 2. 检查当前配置
    const currentConfig = window.backendManager.getMainCountdownRewardAddress();
    console.log('📋 当前奖励配置:', currentConfig);
    
    // 3. 检查 localStorage 数据
    const rewardAddressData = localStorage.getItem('mainCountdownRewardAddress');
    const mainCountdownRewards = localStorage.getItem('mainCountdownRewards');
    
    console.log('📦 localStorage mainCountdownRewardAddress:', rewardAddressData);
    console.log('📦 localStorage mainCountdownRewards:', mainCountdownRewards);
    
    // 4. 模拟设置奖励地址（如果需要测试）
    if (!currentConfig || !currentConfig.address) {
        console.log('⚠️ 未找到奖励地址配置，可以运行以下命令来设置测试地址：');
        console.log('window.backendManager.setMainCountdownRewardAddress("你的测试地址")');
    }
    
} else {
    console.log('❌ BackendManager 未加载');
}

// 5. 检查钱包连接状态
if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
    console.log('✅ Phantom 钱包可用');
    
    // 检查是否已连接
    if (window.solana.isConnected) {
        console.log('✅ 钱包已连接');
        console.log('💰 钱包地址:', window.solana.publicKey.toString());
    } else {
        console.log('⚠️ 钱包未连接');
    }
} else {
    console.log('❌ Phantom 钱包不可用');
}

// 6. 提供测试命令
console.log('\n🧪 可用的测试命令:');
console.log('- window.backendManager.setMainCountdownRewardAddress("地址") - 设置奖励地址');
console.log('- window.backendManager.getMainCountdownRewardAddress() - 获取奖励地址');
console.log('- window.backendManager.clearMainCountdownRewardAddress() - 清除奖励地址');
console.log('- localStorage.getItem("mainCountdownRewardAddress") - 查看本地存储的奖励地址');
console.log('- localStorage.getItem("mainCountdownRewards") - 查看本地存储的奖励记录');

console.log('\n🎯 测试完成！'); 