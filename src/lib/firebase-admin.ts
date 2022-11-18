import type { ServiceAccount } from "firebase-admin";
import admin from "firebase-admin";

const serviceAccount = process.env.NEXT_PUBLIC_FIREBASE_ADMIN as ServiceAccount;

try {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
	console.log("Admin Initialized.");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
} catch (error: any) {
	/*
	 * We skip the "already exists" message which is
	 * not an actual error when we're hot-reloading.
	 */
	if (!/already exists/u.test(error.message)) {
		console.error("Firebase admin initialization error", error.stack);
	}
}

export default admin;
