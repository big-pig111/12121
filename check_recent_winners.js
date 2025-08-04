// 查看最近大额交易获奖地址的控制台脚本
// 直接复制粘贴到浏览器控制台运行

console.log('🔍 开始检查最近的大额交易获奖地址...');

// 1. 检查大额交易通知
function checkRecentLargeTransactions() {
    console.log('\n📊 检查最近的大额交易...');
    
    const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
    if (!notifications) {
        console.log('❌ 没有找到大额交易通知数据');
        return [];
    }
    
    const notificationList = JSON.parse(notifications);
    console.log(`✅ 找到 ${notificationList.length} 条大额交易通知`);
    
    // 按时间排序（最新的在前）
    const sortedNotifications = notificationList.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    return sortedNotifications;
}

// 2. 检查倒计时状态
function checkCountdownStatus() {
    console.log('\n⏰ 检查倒计时状态...');
    
    const countdown = localStorage.getItem('memeCoinCountdown');
    if (!countdown) {
        console.log('❌ 没有找到倒计时数据');
        return null;
    }
    
    const countdownData = JSON.parse(countdown);
    const targetDate = new Date(countdownData.targetDate);
    const currentDate = new Date();
    const isExpired = targetDate < currentDate;
    
    console.log('倒计时信息:', {
        targetDate: targetDate.toLocaleString(),
        currentDate: currentDate.toLocaleString(),
        isExpired: isExpired,
        timeRemaining: isExpired ? '已过期' : `${Math.floor((targetDate - currentDate) / 1000)}秒`
    });
    
    return { countdownData, isExpired };
}

// 3. 分析潜在的获奖地址
function analyzePotentialWinners(notifications, countdownInfo) {
    console.log('\n🏆 分析潜在的获奖地址...');
    
    if (!notifications || notifications.length === 0) {
        console.log('❌ 没有大额交易数据可分析');
        return [];
    }
    
    const countdownEndTime = countdownInfo ? new Date(countdownInfo.countdownData.targetDate).getTime() : Date.now();
    
    // 筛选买入交易
    const buyTransactions = notifications.filter(notification => {
        if (!notification.transaction || 
            !notification.transaction.type || 
            notification.transaction.type.toLowerCase() !== 'buy') {
            return false;
        }
        
        const transactionTime = new Date(notification.timestamp).getTime();
        const isBeforeCountdownEnd = transactionTime <= countdownEndTime;
        
        return isBeforeCountdownEnd;
    });
    
    console.log(`✅ 找到 ${buyTransactions.length} 条在倒计时结束前的买入交易`);
    
    // 按金额排序（金额大的在前）
    const sortedBuyTransactions = buyTransactions.sort((a, b) => {
        return (b.transaction.amount || 0) - (a.transaction.amount || 0);
    });
    
    return sortedBuyTransactions;
}

// 4. 检查现有快照
function checkExistingSnapshots() {
    console.log('\n📸 检查现有快照...');
    
    const snapshots = localStorage.getItem('mainCountdownAddressSnapshots');
    if (!snapshots) {
        console.log('❌ 没有找到快照数据');
        return [];
    }
    
    const snapshotList = JSON.parse(snapshots);
    console.log(`✅ 找到 ${snapshotList.length} 条快照记录`);
    
    // 按时间排序（最新的在前）
    const sortedSnapshots = snapshotList.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return sortedSnapshots;
}

// 5. 检查现有奖励
function checkExistingRewards() {
    console.log('\n🎁 检查现有奖励...');
    
    const rewards = localStorage.getItem('mainCountdownRewards');
    if (!rewards) {
        console.log('❌ 没有找到奖励数据');
        return [];
    }
    
    const rewardList = JSON.parse(rewards);
    console.log(`✅ 找到 ${rewardList.length} 条奖励记录`);
    
    // 按时间排序（最新的在前）
    const sortedRewards = rewardList.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return sortedRewards;
}

// 6. 显示详细信息
function displayDetailedInfo(notifications, potentialWinners, snapshots, rewards) {
    console.log('\n📋 详细信息汇总:');
    console.log('='.repeat(80));
    
    // 显示最近的大额交易
    console.log('\n🔥 最近的大额交易 (前10条):');
    notifications.slice(0, 10).forEach((notification, index) => {
        const transaction = notification.transaction;
        const timestamp = new Date(notification.timestamp).toLocaleString();
        console.log(`${index + 1}. ${transaction.type.toUpperCase()} | ${transaction.amount.toLocaleString()} 代币 | ${transaction.trader} | ${timestamp}`);
    });
    
    // 显示潜在的获奖地址
    console.log('\n🏆 潜在的获奖地址 (按金额排序):');
    if (potentialWinners.length === 0) {
        console.log('❌ 没有找到符合条件的买入交易');
    } else {
        potentialWinners.forEach((winner, index) => {
            const transaction = winner.transaction;
            const timestamp = new Date(winner.timestamp).toLocaleString();
            console.log(`${index + 1}. ${transaction.trader} | ${transaction.amount.toLocaleString()} 代币 | ${timestamp}`);
        });
        
        // 显示最可能的获奖者
        const mostLikelyWinner = potentialWinners[0];
        console.log(`\n🎯 最可能的获奖者: ${mostLikelyWinner.transaction.trader}`);
        console.log(`💰 交易金额: ${mostLikelyWinner.transaction.amount.toLocaleString()} 代币`);
        console.log(`⏰ 交易时间: ${new Date(mostLikelyWinner.timestamp).toLocaleString()}`);
    }
    
    // 显示现有快照
    console.log('\n📸 现有快照记录 (前5条):');
    if (snapshots.length === 0) {
        console.log('❌ 没有快照记录');
    } else {
        snapshots.slice(0, 5).forEach((snapshot, index) => {
            const createdAt = new Date(snapshot.createdAt).toLocaleString();
            console.log(`${index + 1}. ${snapshot.winner} | ${snapshot.transactionAmount.toLocaleString()} 代币 | ${createdAt}`);
        });
    }
    
    // 显示现有奖励
    console.log('\n🎁 现有奖励记录 (前5条):');
    if (rewards.length === 0) {
        console.log('❌ 没有奖励记录');
    } else {
        rewards.slice(0, 5).forEach((reward, index) => {
            const createdAt = new Date(reward.createdAt).toLocaleString();
            const status = reward.claimed ? '已领取' : '未领取';
            console.log(`${index + 1}. ${reward.winner} | ${reward.amount.toLocaleString()} 积分 | ${status} | ${createdAt}`);
        });
    }
    
    console.log('\n' + '='.repeat(80));
}

// 7. 预测下一个获奖者
function predictNextWinner(potentialWinners, countdownInfo) {
    console.log('\n🔮 预测下一个获奖者...');
    
    if (!countdownInfo || !countdownInfo.isExpired) {
        console.log('⏳ 倒计时尚未结束，无法确定获奖者');
        return null;
    }
    
    if (potentialWinners.length === 0) {
        console.log('❌ 没有符合条件的交易，无法确定获奖者');
        return null;
    }
    
    const nextWinner = potentialWinners[0];
    console.log('🎯 预测的获奖者信息:');
    console.log(`地址: ${nextWinner.transaction.trader}`);
    console.log(`交易金额: ${nextWinner.transaction.amount.toLocaleString()} 代币`);
    console.log(`交易时间: ${new Date(nextWinner.timestamp).toLocaleString()}`);
    console.log(`交易签名: ${nextWinner.transaction.signature}`);
    
    return nextWinner;
}

// 8. 主函数
function analyzeRecentWinners() {
    console.log('🚀 开始分析最近的大额交易获奖地址...\n');
    
    // 检查各个数据源
    const notifications = checkRecentLargeTransactions();
    const countdownInfo = checkCountdownStatus();
    const potentialWinners = analyzePotentialWinners(notifications, countdownInfo);
    const snapshots = checkExistingSnapshots();
    const rewards = checkExistingRewards();
    
    // 显示详细信息
    displayDetailedInfo(notifications, potentialWinners, snapshots, rewards);
    
    // 预测下一个获奖者
    const predictedWinner = predictNextWinner(potentialWinners, countdownInfo);
    
    // 返回结果对象
    return {
        notifications,
        countdownInfo,
        potentialWinners,
        snapshots,
        rewards,
        predictedWinner
    };
}

// 9. 辅助函数：检查特定地址的获奖情况
function checkAddressWinningStatus(address) {
    console.log(`\n🔍 检查地址 ${address} 的获奖情况...`);
    
    const rewards = localStorage.getItem('mainCountdownRewards');
    if (!rewards) {
        console.log('❌ 没有奖励数据');
        return null;
    }
    
    const rewardList = JSON.parse(rewards);
    const addressRewards = rewardList.filter(reward => reward.winner === address);
    
    if (addressRewards.length === 0) {
        console.log(`❌ 地址 ${address} 没有获奖记录`);
        return null;
    }
    
    console.log(`✅ 地址 ${address} 有 ${addressRewards.length} 条获奖记录:`);
    addressRewards.forEach((reward, index) => {
        const createdAt = new Date(reward.createdAt).toLocaleString();
        const status = reward.claimed ? '已领取' : '未领取';
        console.log(`${index + 1}. ${reward.amount.toLocaleString()} 积分 | ${status} | ${createdAt}`);
    });
    
    return addressRewards;
}

// 10. 辅助函数：清除所有数据
function clearAllData() {
    console.log('\n🗑️ 清除所有数据...');
    
    localStorage.removeItem('memeCoinLargeTransactionNotifications');
    localStorage.removeItem('memeCoinCountdown');
    localStorage.removeItem('mainCountdownAddressSnapshots');
    localStorage.removeItem('mainCountdownRewards');
    localStorage.removeItem('walletConnection');
    
    console.log('✅ 所有数据已清除');
}

// 自动执行主分析
const analysisResult = analyzeRecentWinners();

console.log(`
📖 可用函数:
- analyzeRecentWinners()  // 重新分析获奖地址
- checkAddressWinningStatus('地址')  // 检查特定地址的获奖情况
- clearAllData()  // 清除所有数据

示例:
checkAddressWinningStatus('test_winner_quick_123')  // 检查特定地址
analyzeRecentWinners()  // 重新分析
`);

// 导出结果到全局变量，方便后续使用
window.winnerAnalysis = analysisResult;
console.log('\n💡 分析结果已保存到 window.winnerAnalysis，可在控制台中使用'); 