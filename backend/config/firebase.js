const admin = require('firebase-admin');

let firebaseApp = null;

const initializeFirebase = () => {
  try {
    if (!firebaseApp && process.env.FIREBASE_PROJECT_ID) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
  }
};

const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    if (!firebaseApp) {
      console.warn('⚠️ Firebase not initialized, skipping push notification');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending push notification:', error.message);
    throw error;
  }
};

const sendMulticastNotification = async (tokens, title, body, data = {}) => {
  try {
    if (!firebaseApp || !tokens.length) {
      console.warn('⚠️ Firebase not initialized or no tokens provided');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`✅ Multicast notification sent: ${response.successCount}/${tokens.length} successful`);
    return response;
  } catch (error) {
    console.error('❌ Error sending multicast notification:', error.message);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendMulticastNotification,
  admin: () => firebaseApp
};