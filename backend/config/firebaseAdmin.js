import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const privateKey = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
  : undefined;

if (process.env.FIREBASE_PROJECT_ID && privateKey) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
} else {
  console.warn("Firebase Admin missing configuration.");
}

export default admin;
