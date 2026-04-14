import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getPrivateKey(): string {
  // Prefer the base64-encoded version to avoid OpenSSL 3.0 / Next.js
  // double-escaping issues with raw PEM keys in .env.local.
  const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64;
  if (b64) {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  // Fallback: raw PEM with escaped newlines.
  return (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
}

const isNew = !getApps().length;

const adminApp = isNew
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
    })
  : getApps()[0];

export const adminDb = getFirestore(adminApp);

if (isNew) {
  adminDb.settings({ preferRest: true });
}
export const adminAuth = getAuth(adminApp);
