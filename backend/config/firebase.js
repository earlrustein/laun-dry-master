const admin = require('firebase-admin');
const serviceAccount = Buffer.from(process.env.FIREBASE_KEY_JSON, 'base64').toString('utf8');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };