import type { ServiceAccount } from "firebase-admin";
import admin from "firebase-admin";
import serviceAccount from "./serviceAccount.json";

try {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount as ServiceAccount),
	});
	admin.firestore().settings({ ignoreUndefinedProperties: true });
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
