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
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

export default create;
