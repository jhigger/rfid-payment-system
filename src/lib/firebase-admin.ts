import type { ServiceAccount } from "firebase-admin";
import admin from "firebase-admin";

const serviceAccount = process.env.NEXT_PUBLIC_FIREBASE_ADMIN as ServiceAccount;

export default admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});
