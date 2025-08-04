# 🎁 奖励控制面板使用说明

## 概述

奖励控制面板是一个专门用于管理100,000积分奖励的Web界面，可以控制获奖地址设置、监控奖励状态，并与Firebase后端进行数据同步。

## 功能特性

### 🔗 Firebase 连接管理
- 实时检查Firebase连接状态
- 自动同步数据到云端
- 支持离线模式（localStorage缓存）

### 🏆 获奖地址控制
- 设置/清除获奖钱包地址
- 自定义奖励积分数量（默认100,000）
- Solana地址格式验证
- 实时状态监控

### 📊 奖励状态监控
- 显示当前获奖地址
- 显示奖励积分数量
- 显示设置状态
- 实时刷新功能

### 📋 操作日志
- 记录所有操作历史
- 支持日志清除
- 时间戳记录

## 文件结构

```
reward-control-panel.html    # 主控制面板界面
reward-control.js           # 控制面板核心逻辑
js/modules/BackendManager.js # 后端管理器（依赖）
```

## 安装和配置

### 1. Firebase 配置

在 `reward-control.js` 中更新您的Firebase配置：

```javascript
const firebaseConfig = {
    apiKey: "您的API密钥",
    authDomain: "您的项目域名",
    databaseURL: "您的数据库URL",
    projectId: "您的项目ID",
    storageBucket: "您的存储桶",
    messagingSenderId: "您的发送者ID",
    appId: "您的应用ID"
};
```

### 2. 依赖文件

确保以下文件存在：
- `js/modules/BackendManager.js` - 后端管理器
- Firebase SDK（通过CDN加载）

## 使用方法

### 基本操作

1. **打开控制面板**
   ```
   在浏览器中打开 reward-control-panel.html
   ```

2. **初始化系统**
   ```
   页面加载时会自动初始化Firebase和BackendManager
   ```

3. **设置获奖地址**
   ```
   1. 在"获奖地址设置"区域输入Solana钱包地址
   2. 设置奖励积分数量（默认100,000）
   3. 点击"设置获奖地址"按钮
   ```

4. **监控状态**
   ```
   在"奖励状态监控"区域查看当前设置状态
   点击"刷新状态"按钮更新信息
   ```

### 高级功能

#### 导出奖励数据
```javascript
// 在浏览器控制台执行
window.rewardControlPanel.exportRewardData();
```

#### 导入奖励数据
```javascript
// 在浏览器控制台执行
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        await window.rewardControlPanel.importRewardData(file);
    }
};
fileInput.click();
```

#### 重置所有奖励
```javascript
// 在浏览器控制台执行
await window.rewardControlPanel.resetAllRewards();
```

## API 参考

### RewardControlPanel 类

#### 初始化
```javascript
const controlPanel = new RewardControlPanel();
await controlPanel.init();
```

#### 设置获奖地址
```javascript
await controlPanel.setWinnerAddress(address, amount);
// address: Solana钱包地址
// amount: 奖励积分数量（可选，默认100000）
```

#### 清除获奖地址
```javascript
await controlPanel.clearWinnerAddress();
```

#### 获取当前获奖地址
```javascript
const rewardData = controlPanel.getCurrentWinnerAddress();
```

#### 检查Firebase连接
```javascript
const status = await controlPanel.checkFirebaseConnection();
// 返回: { connected: boolean, message: string }
```

#### 获取系统状态
```javascript
const status = controlPanel.getSystemStatus();
// 返回: {
//   initialized: boolean,
//   firebaseConnected: boolean,
//   backendManagerAvailable: boolean,
//   currentWinnerAddress: object,
//   totalRewards: number,
//   claimedRewards: number,
//   pendingRewards: number
// }
```

## 数据同步机制

### 本地存储 (localStorage)
- `mainCountdownRewardAddress`: 获奖地址配置
- `mainCountdownRewards`: 奖励记录列表

### Firebase 同步
- `mainCountdownRewards`: 云端奖励数据
- 实时同步本地和云端数据

### 同步优先级
1. 本地localStorage（优先）
2. Firebase云端数据（备用）
3. 自动同步机制

## 错误处理

### 常见错误及解决方案

1. **Firebase 未初始化**
   ```
   错误: Firebase 初始化失败
   解决: 检查Firebase配置是否正确
   ```

2. **BackendManager 未加载**
   ```
   错误: BackendManager 未加载
   解决: 确保 js/modules/BackendManager.js 文件存在
   ```

3. **无效的Solana地址**
   ```
   错误: 无效的 Solana 地址格式
   解决: 检查地址格式是否正确（32-44位字符）
   ```

4. **连接失败**
   ```
   错误: Firebase 连接失败
   解决: 检查网络连接和Firebase配置
   ```

## 安全注意事项

1. **API密钥保护**
   - 不要在客户端代码中暴露敏感信息
   - 使用环境变量或配置文件

2. **地址验证**
   - 所有Solana地址都会进行格式验证
   - 支持32-44位字符的Base58编码

3. **数据备份**
   - 定期导出奖励数据作为备份
   - 使用Firebase的自动备份功能

## 与现有系统集成

### 与 claim-reward.html 集成
控制面板设置的获奖地址会自动同步到领取页面：

```javascript
// 在 claim-reward.html 中检查获奖地址
const rewardAddressData = localStorage.getItem('mainCountdownRewardAddress');
if (rewardAddressData) {
    const rewardConfig = JSON.parse(rewardAddressData);
    if (rewardConfig.address === walletAddress && rewardConfig.isSet) {
        // 用户有资格领取奖励
    }
}
```

### 与 admin.html 集成
控制面板可以与现有的管理后台并行使用：

```javascript
// 在 admin.html 中使用相同的BackendManager
const backendManager = new BackendManager();
backendManager.setMainCountdownRewardAddress(address);
```

## 故障排除

### 调试模式
在浏览器控制台中启用调试：

```javascript
// 查看控制面板状态
console.log(window.rewardControlPanel.getSystemStatus());

// 查看所有奖励记录
console.log(window.rewardControlPanel.getAllRewards());

// 查看操作日志
document.addEventListener('rewardControlLog', (e) => {
    console.log('操作日志:', e.detail);
});
```

### 数据恢复
如果数据丢失，可以从备份恢复：

```javascript
// 从导出的JSON文件恢复数据
await window.rewardControlPanel.importRewardData(backupFile);
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的获奖地址设置
- Firebase集成
- 操作日志记录

## 技术支持

如有问题，请检查：
1. 浏览器控制台错误信息
2. Firebase连接状态
3. 网络连接
4. 文件依赖是否正确加载

---

**注意**: 使用前请确保已正确配置Firebase项目并更新相关配置信息。 