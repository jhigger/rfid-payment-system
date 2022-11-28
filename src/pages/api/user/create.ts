// import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "../../../lib/firebase-admin";
import { isAuthorizedUser } from "../../../utils/helperFunctions";

const create = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "POST") {
			// Process a POST request
			const { authorizedUid, email, password } = req.body;

			await isAuthorizedUser(authorizedUid, res);

			const user = await admin.auth().createUser({
				email,
				password,
			});
			res.status(200).json({ ...user });
		} else {
			// Handle any other HTTP method
			res.status(200).json({ name: "Hello, world!" });
		}
	} catch (error: any) {
		console.log({ message: error.errorInfo.message });
		res.status(500).json({ message: error.errorInfo.message });
	}
};

export default create;
