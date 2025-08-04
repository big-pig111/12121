// Firebase Cloud Function Example: claimToken
// This is an example implementation of the claimToken cloud function
// You need to deploy this to your Firebase project

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin SDK
admin.initializeApp();

// Cloud Function: getPointsBalance
// Gets the current points balance for a user
exports.getPointsBalance = functions.https.onCall(async (data, context) => {
    try {
        // Validate input data - support both wallet and walletAddress parameters
        const walletAddress = data.wallet || data.walletAddress;
        
        if (!walletAddress) {
            throw new Error('Missing required parameter: wallet or walletAddress');
        }
        
        // Get Firestore database reference
        const db = admin.firestore();
        
        // Get user document
        const userRef = db.collection('users').doc(walletAddress);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            // Return 0 points for new users
            return {
                success: true,
                walletAddress: walletAddress,
                points: 0,
                memeTokens: 0,
                message: 'User not found, returning 0 points'
            };
        }
        
        const userData = userDoc.data();
        
        return {
            success: true,
            walletAddress: walletAddress,
            points: userData.points || 0,
            memeTokens: userData.memeTokens || 0,
            lastUpdated: userData.lastUpdated,
            message: 'Points balance retrieved successfully'
        };
        
    } catch (error) {
        console.error('Error getting points balance:', error);
        throw new Error(`Failed to get points balance: ${error.message}`);
    }
});

// Cloud Function: syncClaimedPoints
// Syncs claimed points to user's account in Firestore
exports.syncClaimedPoints = functions.https.onCall(async (data, context) => {
    try {
        // Validate input data - support both parameter formats
        const walletAddress = data.wallet || data.walletAddress;
        const pointsAmount = data.points || data.pointsAmount;
        const rewardType = data.type || data.rewardType;
        
        if (!walletAddress || !pointsAmount || !rewardType) {
            throw new Error('Missing required parameters: wallet/walletAddress, points/pointsAmount, type/rewardType');
        }
        
        if (pointsAmount <= 0) {
            throw new Error('Invalid points amount: must be positive');
        }
        
        // Get Firestore database reference
        const db = admin.firestore();
        
        // Get or create user document
        const userRef = db.collection('users').doc(walletAddress);
        const userDoc = await userRef.get();
        
        let userData = {};
        if (userDoc.exists) {
            userData = userDoc.data();
        }
        
        // Create transaction to ensure data consistency
        const result = await db.runTransaction(async (transaction) => {
            // Re-read user data in transaction
            const userDoc = await transaction.get(userRef);
            const userData = userDoc.data() || {};
            const currentPoints = userData.points || 0;
            const newPoints = currentPoints + pointsAmount;
            
            // Update user points
            transaction.set(userRef, {
                walletAddress: walletAddress,
                points: newPoints,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                ...userData // Preserve other user data
            }, { merge: true });
            
            return { currentPoints, newPoints };
        });
        
        // Add to claim history for audit
        const claimHistoryRef = db.collection('claimHistory').doc();
        await claimHistoryRef.set({
            walletAddress: walletAddress,
            pointsAmount: pointsAmount,
            rewardType: rewardType,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            previousPoints: result.currentPoints,
            newPoints: result.newPoints
        });
        
        return {
            success: true,
            walletAddress: walletAddress,
            pointsAdded: pointsAmount,
            previousPoints: result.currentPoints,
            newPoints: result.newPoints,
            rewardType: rewardType,
            message: 'Points synced successfully'
        };
        
    } catch (error) {
        console.error('Error syncing claimed points:', error);
        throw new Error(`Failed to sync claimed points: ${error.message}`);
    }
});

// Cloud Function: claimToken
// Exchanges points for tokens
exports.claimToken = functions.https.onCall(async (data, context) => {
    try {
        // Validate input data - support both parameter formats
        const walletAddress = data.wallet || data.walletAddress;
        const pointsAmount = data.points || data.pointsAmount;
        const tokenAmount = data.tokens || data.tokenAmount;
        
        if (!walletAddress) {
            throw new Error('钱包地址不能为空');
        }
        
        if (!pointsAmount || pointsAmount <= 0) {
            throw new Error('积分数量必须大于0');
        }
        
        if (!tokenAmount || tokenAmount <= 0) {
            throw new Error('代币数量必须大于0');
        }
        
        // Get Firestore database reference
        const db = admin.firestore();
        
        // Get user document
        const userRef = db.collection('users').doc(walletAddress);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            throw new Error('用户不存在，请先领取积分');
        }
        
        const userData = userDoc.data();
        const currentPoints = userData.points || 0;
        
        if (currentPoints < pointsAmount) {
            throw new Error('没有可兑换的积分');
        }
        
        // Create transaction to ensure data consistency
        const result = await db.runTransaction(async (transaction) => {
            // Re-read user data in transaction
            const userDoc = await transaction.get(userRef);
            const userData = userDoc.data() || {};
            const currentPoints = userData.points || 0;
            const currentTokens = userData.memeTokens || 0;
            
            if (currentPoints < pointsAmount) {
                throw new Error('没有可兑换的积分');
            }
            
            const newPoints = currentPoints - pointsAmount;
            const newTokens = currentTokens + tokenAmount;
            
            // Update user data
            transaction.set(userRef, {
                walletAddress: walletAddress,
                points: newPoints,
                memeTokens: newTokens,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                ...userData // Preserve other user data
            }, { merge: true });
            
            return { 
                previousPoints: currentPoints, 
                newPoints: newPoints,
                previousTokens: currentTokens,
                newTokens: newTokens
            };
        });
        
        // Add to exchange history for audit
        const exchangeHistoryRef = db.collection('exchangeHistory').doc();
        await exchangeHistoryRef.set({
            walletAddress: walletAddress,
            pointsExchanged: pointsAmount,
            tokensReceived: tokenAmount,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            previousPoints: result.previousPoints,
            newPoints: result.newPoints,
            previousTokens: result.previousTokens,
            newTokens: result.newTokens
        });
        
        return {
            success: true,
            walletAddress: walletAddress,
            pointsExchanged: pointsAmount,
            tokensReceived: tokenAmount,
            remainingPoints: result.newPoints,
            totalTokens: result.newTokens,
            message: '代币兑换成功'
        };
        
    } catch (error) {
        console.error('Error claiming tokens:', error);
        throw new Error(error.message || '代币兑换失败');
    }
});

// Alternative HTTP functions with explicit CORS handling (if needed)
// These are alternative implementations using HTTP triggers instead of callable functions

exports.getPointsBalanceHTTP = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            const { walletAddress } = req.body;
            
            if (!walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameter: walletAddress'
                });
            }
            
            const db = admin.firestore();
            const userRef = db.collection('users').doc(walletAddress);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                return res.json({
                    success: true,
                    walletAddress: walletAddress,
                    points: 0,
                    memeTokens: 0
                });
            }
            
            const userData = userDoc.data();
            
            return res.json({
                success: true,
                walletAddress: walletAddress,
                points: userData.points || 0,
                memeTokens: userData.memeTokens || 0,
                lastUpdated: userData.lastUpdated
            });
            
        } catch (error) {
            console.error('Error getting points balance:', error);
            return res.status(500).json({
                success: false,
                error: `Failed to get points balance: ${error.message}`
            });
        }
    });
});

exports.claimTokenHTTP = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            const { walletAddress, pointsAmount, tokenAmount } = req.body;
            
            if (!walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: '钱包地址不能为空'
                });
            }
            
            if (!pointsAmount || pointsAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: '积分数量必须大于0'
                });
            }
            
            if (!tokenAmount || tokenAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: '代币数量必须大于0'
                });
            }
            
            const db = admin.firestore();
            const userRef = db.collection('users').doc(walletAddress);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                return res.status(400).json({
                    success: false,
                    error: '用户不存在，请先领取积分'
                });
            }
            
            const userData = userDoc.data();
            const currentPoints = userData.points || 0;
            
            if (currentPoints < pointsAmount) {
                return res.status(400).json({
                    success: false,
                    error: '没有可兑换的积分'
                });
            }
            
            const result = await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const userData = userDoc.data() || {};
                const currentPoints = userData.points || 0;
                const currentTokens = userData.memeTokens || 0;
                
                if (currentPoints < pointsAmount) {
                    throw new Error('没有可兑换的积分');
                }
                
                const newPoints = currentPoints - pointsAmount;
                const newTokens = currentTokens + tokenAmount;
                
                transaction.set(userRef, {
                    walletAddress: walletAddress,
                    points: newPoints,
                    memeTokens: newTokens,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    ...userData
                }, { merge: true });
                
                return { 
                    previousPoints: currentPoints, 
                    newPoints: newPoints,
                    previousTokens: currentTokens,
                    newTokens: newTokens
                };
            });
            
            const exchangeHistoryRef = db.collection('exchangeHistory').doc();
            await exchangeHistoryRef.set({
                walletAddress: walletAddress,
                pointsExchanged: pointsAmount,
                tokensReceived: tokenAmount,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                previousPoints: result.previousPoints,
                newPoints: result.newPoints,
                previousTokens: result.previousTokens,
                newTokens: result.newTokens
            });
            
            return res.json({
                success: true,
                walletAddress: walletAddress,
                pointsExchanged: pointsAmount,
                tokensReceived: tokenAmount,
                remainingPoints: result.newPoints,
                totalTokens: result.newTokens,
                message: '代币兑换成功'
            });
            
        } catch (error) {
            console.error('Error claiming tokens:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '代币兑换失败'
            });
        }
    });
});

// Optional: Function to get user balance
exports.getUserBalance = functions.https.onCall(async (data, context) => {
    try {
        const { walletAddress } = data;
        
        if (!walletAddress) {
            throw new Error('Missing walletAddress parameter');
        }
        
        const db = admin.firestore();
        const userRef = db.collection('users').doc(walletAddress);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return {
                success: true,
                data: {
                    walletAddress: walletAddress,
                    points: 0,
                    memeTokens: 0
                }
            };
        }
        
        const userData = userDoc.data();
        
        return {
            success: true,
            data: {
                walletAddress: walletAddress,
                points: userData.points || 0,
                memeTokens: userData.memeTokens || 0,
                lastUpdated: userData.lastUpdated,
                lastTokenUpdate: userData.lastTokenUpdate
            }
        };
        
    } catch (error) {
        console.error('Get balance error:', error);
        
        return {
            success: false,
            error: error.message
        };
    }
});

// Optional: Function to add points to user (for testing or admin use)
exports.addPoints = functions.https.onCall(async (data, context) => {
    try {
        const { walletAddress, points, reason } = data;
        
        if (!walletAddress || !points) {
            throw new Error('Missing required parameters: walletAddress, points');
        }
        
        if (points <= 0) {
            throw new Error('Points must be positive');
        }
        
        const db = admin.firestore();
        const userRef = db.collection('users').doc(walletAddress);
        
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                const currentPoints = userData.points || 0;
                const newPoints = currentPoints + points;
                
                transaction.update(userRef, {
                    points: newPoints,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Create new user
                transaction.set(userRef, {
                    walletAddress: walletAddress,
                    points: points,
                    memeTokens: 0,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // Record the points addition
            const pointsRef = db.collection('pointsHistory').doc();
            transaction.set(pointsRef, {
                walletAddress: walletAddress,
                pointsAdded: points,
                reason: reason || 'Manual addition',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        
        return {
            success: true,
            message: `Added ${points} points to ${walletAddress}`,
            data: {
                walletAddress: walletAddress,
                pointsAdded: points,
                reason: reason
            }
        };
        
    } catch (error) {
        console.error('Add points error:', error);
        
        return {
            success: false,
            error: error.message
        };
    }
});

// Firestore security rules example
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{walletAddress} {
      allow read, write: if request.auth != null && request.auth.uid == walletAddress;
    }
    
    // Exchanges are read-only for users, writable by cloud functions
    match /exchanges/{exchangeId} {
      allow read: if request.auth != null;
      allow write: if false; // Only cloud functions can write
    }
    
    // Points history is read-only for users
    match /pointsHistory/{historyId} {
      allow read: if request.auth != null;
      allow write: if false; // Only cloud functions can write
    }
  }
}
*/

// Deployment instructions:
// 1. Install Firebase CLI: npm install -g firebase-tools
// 2. Login to Firebase: firebase login
// 3. Initialize project: firebase init functions
// 4. Copy this code to functions/index.js
// 5. Install dependencies: cd functions && npm install firebase-admin firebase-functions
// 6. Deploy: firebase deploy --only functions
//
// Don't forget to:
// - Update your Firebase configuration in the frontend
// - Set up Firestore database
// - Configure security rules
// - Set up authentication if needed 