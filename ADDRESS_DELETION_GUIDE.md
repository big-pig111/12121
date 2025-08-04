# 💰 地址数据删除指南

## 📍 数据存储位置

### 1. 成功地址（大额买入地址）
左边五个最新地址（大额买入地址）的数据存储在以下位置：

### 1. 本地存储
- **键名**: `memeCoinSuccessAddresses`
- **位置**: 浏览器 localStorage
- **格式**: JSON 数组

- **数据库 URL**: `https://chat-294cc-default-rtdb.firebaseio.com`
- **节点路径**: `successAddresses`
- **项目 ID**: `chat-294cc`

### 2. 持仓地址（Top 20 持有者）
持仓地址数据存储在以下位置：

#### 本地存储
- **键名**: `memeCoinTokenHolders`
- **位置**: 浏览器 localStorage
- **格式**: JSON 对象（包含 holders 数组）

#### Firebase 数据库
- **数据库 URL**: `https://chat-294cc-default-rtdb.firebaseio.com`
- **节点路径**: `tokenHolders`
- **项目 ID**: `chat-294cc`

## 🛠️ 删除方法

### 方法一：使用网页管理工具（推荐）

1. **打开管理工具**：
   ```
   在浏览器中打开 address-manager.html
   ```

2. **功能说明**：
   - ✅ 查看本地和 Firebase 数据
   - ✅ 删除单个地址
   - ✅ 清空所有数据
   - ✅ 数据同步功能
   - ✅ 实时状态显示
   - ✅ 分别管理成功地址和持仓地址

3. **操作步骤**：
   - 点击 "刷新本地数据" 查看当前数据
   - 点击 "刷新 Firebase 数据" 查看云端数据
   - 在地址列表中点击 "删除" 按钮删除单个地址
   - 点击 "清空本地数据" 或 "清空 Firebase 数据" 删除所有数据
   - 可以分别管理成功地址和持仓地址

### 方法二：使用浏览器开发者工具

1. **打开开发者工具**：
   - 按 `F12` 或右键选择 "检查"
   - 切换到 "Console" 标签

2. **查看数据**：
   ```javascript
   // 查看本地数据
   const data = localStorage.getItem('memeCoinSuccessAddresses');
   console.log(JSON.parse(data));
   ```

3. **删除数据**：
   ```javascript
   // 删除成功地址本地数据
   localStorage.removeItem('memeCoinSuccessAddresses');
   
   // 或者清空为空的数组
   localStorage.setItem('memeCoinSuccessAddresses', JSON.stringify([]));
   
   // 删除持仓地址本地数据
   localStorage.removeItem('memeCoinTokenHolders');
   
   // 或者清空为空的数组
   localStorage.setItem('memeCoinTokenHolders', JSON.stringify({
       holders: [],
       timestamp: Date.now(),
       tokenAddress: ''
   }));
   ```

### 方法三：使用 Node.js 脚本

1. **安装依赖**：
   ```bash
   npm install firebase-admin
   ```

2. **配置 Firebase 服务账号**：
   - 在 `address-manager.js` 中填入正确的服务账号信息
   - 或者使用环境变量

3. **运行命令**：
   ```bash
   # 查看所有地址
   node address-manager.js view
   
   # 删除所有地址
   node address-manager.js clear
   
   # 删除指定索引的地址（从0开始）
   node address-manager.js delete-index 0
   
   # 删除指定地址
   node address-manager.js delete-address "ABC123..."
   
   # 持仓地址管理命令
   node address-manager.js view-holders
   node address-manager.js clear-holders
   node address-manager.js delete-holder-index 0
   node address-manager.js delete-holder-address "ABC123..."
   ```

## 📊 数据结构

### 成功地址数据结构

每个成功地址的数据结构如下：

```json
{
  "address": "钱包地址",
  "amount": "买入数量",
  "timestamp": "ISO时间戳",
  "date": "日期字符串",
  "time": "时间字符串"
}
```

示例：
```json
[
  {
    "address": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    "amount": "1000000",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "date": "1/1/2024",
    "time": "12:00:00 PM"
  }
]
```

### 持仓地址数据结构

持仓地址数据的完整结构如下：

```json
{
  "holders": [
    {
      "address": "钱包地址",
      "balance": 1000000,
      "rank": 1
    }
  ],
  "timestamp": 1704067200000,
  "tokenAddress": "代币合约地址"
}
```

示例：
```json
{
  "holders": [
    {
      "address": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
      "balance": 1000000,
      "rank": 1
    },
    {
      "address": "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
      "balance": 500000,
      "rank": 2
    }
  ],
  "timestamp": 1704067200000,
  "tokenAddress": "TokenContractAddress123..."
}
```

## ⚠️ 注意事项

1. **数据同步**：
   - 本地存储和 Firebase 数据库会自动同步
   - 删除一个位置的数据后，另一个位置的数据也会被同步删除

2. **备份建议**：
   - 删除前建议先导出数据备份
   - 使用管理工具的 "导出" 功能

3. **权限要求**：
   - 本地存储：任何用户都可以访问
   - Firebase 数据库：需要正确的 API 密钥或服务账号

4. **实时更新**：
   - 删除数据后，网页上的地址列表会实时更新
   - 如果页面没有更新，请刷新页面

## 🔧 故障排除

### 问题：无法连接到 Firebase
**解决方案**：
- 检查网络连接
- 确认 Firebase 配置正确
- 检查 API 密钥是否有效

### 问题：数据删除后仍然显示
**解决方案**：
- 刷新浏览器页面
- 清除浏览器缓存
- 检查是否有其他页面在重新添加数据

### 问题：权限不足
**解决方案**：
- 使用本地存储删除方法
- 联系管理员获取 Firebase 访问权限

## 📞 技术支持

如果遇到问题，可以：
1. 查看浏览器控制台的错误信息
2. 使用管理工具的状态显示功能
3. 检查网络连接和 Firebase 配置

---

**最后更新**: 2024年1月
**版本**: 1.0 