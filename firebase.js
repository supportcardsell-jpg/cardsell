import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: required("FIREBASE_PROJECT_ID"),
        clientEmail: required("FIREBASE_CLIENT_EMAIL"),
        privateKey: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
    });

export const db = getFirestore(app);
export const firebaseAuth = getAuth(app);
