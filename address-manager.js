/**
 * 地址数据管理器 - Node.js 版本
 * 用于管理左边五个最新地址的数据
 */

const admin = require('firebase-admin');

// Firebase 配置
const serviceAccount = {
    "type": "service_account",
    "project_id": "chat-294cc",
    "private_key_id": "YOUR_PRIVATE_KEY_ID",
    "private_key": "YOUR_PRIVATE_KEY",
    "client_email": "YOUR_CLIENT_EMAIL",
    "client_id": "YOUR_CLIENT_ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "YOUR_CERT_URL"
};

// 初始化 Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chat-294cc-default-rtdb.firebaseio.com"
});

const db = admin.database();
const successAddressesRef = db.ref('successAddresses');

/**
 * 查看当前地址数据
 */
async function viewAddresses() {
    try {
        console.log('📋 正在获取地址数据...');
        const snapshot = await successAddressesRef.once('value');
        const data = snapshot.val();
        
        if (data) {
            const addresses = Array.isArray(data) ? data : [];
            console.log(`\n✅ 找到 ${addresses.length} 个地址:\n`);
            
            addresses.forEach((addr, index) => {
                console.log(`${index + 1}. 地址: ${addr.address}`);
                console.log(`   数量: ${addr.amount} tokens`);
                console.log(`   时间: ${addr.date} ${addr.time}`);
                console.log(`   时间戳: ${addr.timestamp}`);
                console.log('');
            });
        } else {
            console.log('❌ 没有找到地址数据');
        }
    } catch (error) {
        console.error('❌ 获取地址数据失败:', error.message);
    }
}

/**
 * 删除所有地址数据
 */
async function clearAllAddresses() {
    try {
        console.log('🗑️ 正在删除所有地址数据...');
        await successAddressesRef.remove();
        console.log('✅ 所有地址数据已删除');
    } catch (error) {
        console.error('❌ 删除地址数据失败:', error.message);
    }
}

/**
 * 删除指定索引的地址
 */
async function deleteAddressByIndex(index) {
    try {
        console.log(`🗑️ 正在删除第 ${index + 1} 个地址...`);
        const snapshot = await successAddressesRef.once('value');
        const data = snapshot.val();
        
        if (data && Array.isArray(data)) {
            if (index >= 0 && index < data.length) {
                data.splice(index, 1);
                await successAddressesRef.set(data);
                console.log(`✅ 第 ${index + 1} 个地址已删除`);
            } else {
                console.log('❌ 索引超出范围');
            }
        } else {
            console.log('❌ 没有找到地址数据');
        }
    } catch (error) {
        console.error('❌ 删除地址失败:', error.message);
    }
}

/**
 * 删除指定地址
 */
async function deleteAddressByValue(address) {
    try {
        console.log(`🗑️ 正在删除地址: ${address}`);
        const snapshot = await successAddressesRef.once('value');
        const data = snapshot.val();
        
        if (data && Array.isArray(data)) {
            const filteredData = data.filter(addr => addr.address !== address);
            if (filteredData.length < data.length) {
                await successAddressesRef.set(filteredData);
                console.log(`✅ 地址 ${address} 已删除`);
            } else {
                console.log('❌ 没有找到指定的地址');
            }
        } else {
            console.log('❌ 没有找到地址数据');
        }
    } catch (error) {
        console.error('❌ 删除地址失败:', error.message);
    }
}

/**
 * 导出地址数据到文件
 */
async function exportAddresses() {
    try {
        console.log('📤 正在导出地址数据...');
        const snapshot = await successAddressesRef.once('value');
        const data = snapshot.val();
        
        if (data) {
            const fs = require('fs');
            const filename = `addresses_${new Date().toISOString().split('T')[0]}.json`;
            fs.writeFileSync(filename, JSON.stringify(data, null, 2));
            console.log(`✅ 地址数据已导出到 ${filename}`);
        } else {
            console.log('❌ 没有找到地址数据');
        }
    } catch (error) {
        console.error('❌ 导出地址数据失败:', error.message);
    }
}

/**
 * 从文件导入地址数据
 */
async function importAddresses(filename) {
    try {
        console.log(`📥 正在从 ${filename} 导入地址数据...`);
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        
        await successAddressesRef.set(data);
        console.log(`✅ 地址数据已从 ${filename} 导入`);
    } catch (error) {
        console.error('❌ 导入地址数据失败:', error.message);
    }
}

/**
 * 显示帮助信息
 */
function showHelp() {
    console.log(`
💰 地址数据管理器 - 使用说明

命令:
  node address-manager.js view                    - 查看所有地址
  node address-manager.js clear                   - 删除所有地址
  node address-manager.js delete-index <index>    - 删除指定索引的地址 (从0开始)
  node address-manager.js delete-address <addr>   - 删除指定地址
  node address-manager.js export                  - 导出地址数据到文件
  node address-manager.js import <filename>       - 从文件导入地址数据
  node address-manager.js help                    - 显示此帮助信息

示例:
  node address-manager.js view
  node address-manager.js delete-index 0
  node address-manager.js delete-address "ABC123..."
  node address-manager.js export
  node address-manager.js import addresses_2024-01-01.json

注意: 使用前请确保已配置正确的 Firebase 服务账号密钥
`);
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'view':
            await viewAddresses();
            break;
        case 'clear':
            await clearAllAddresses();
            break;
        case 'delete-index':
            const index = parseInt(args[1]);
            if (isNaN(index)) {
                console.log('❌ 请提供有效的索引数字');
            } else {
                await deleteAddressByIndex(index);
            }
            break;
        case 'delete-address':
            const address = args[1];
            if (!address) {
                console.log('❌ 请提供要删除的地址');
            } else {
                await deleteAddressByValue(address);
            }
            break;
        case 'export':
            await exportAddresses();
            break;
        case 'import':
            const filename = args[1];
            if (!filename) {
                console.log('❌ 请提供要导入的文件名');
            } else {
                await importAddresses(filename);
            }
            break;
        case 'help':
        default:
            showHelp();
            break;
    }

    // 关闭 Firebase 连接
    admin.app().delete();
}

// 运行主函数
main().catch(console.error); 