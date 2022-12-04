// import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import type { UserData } from "../../../context/FirestoreContext";
import admin from "../../../lib/firebase-admin";
import {
	getUidFromIdNumber,
	isAuthorizedUser,
} from "../../../utils/helperFunctions";

const deleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "DELETE") {
			// Process a DELETE request
			const { authorizedUid, idNumber } = req.body;

			await isAuthorizedUser(authorizedUid, res);

			const uid = await getUidFromIdNumber(idNumber);
			await admin.auth().deleteUser(uid);
			const user = await admin
				.firestore()
				.collection("users")
				.doc(uid)
				.get();
			const { role } = user.data() as UserData;
			await admin.firestore().collection("users").doc(uid).delete();
			await admin.firestore().collection(role).doc(uid).delete();
			res.status(200).json({
				message: `User ${idNumber} deleted successfully.`,
			});
		} else {
			// Handle any other HTTP method
			res.status(200).json({ name: "Hello, world!" });
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.log(error);
		res.status(500).json({ message: error.errorInfo.message });
	}
};

export default deleteUser;
