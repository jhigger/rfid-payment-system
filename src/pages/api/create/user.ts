// import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import type { UserData } from "../../../context/FirestoreContext";
import { Roles } from "../../../context/FirestoreContext";
import admin from "../../../lib/firebase-admin";

const raids = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "POST") {
			// Process a POST request
			const { userUid, email, password } = req.body;
			const docSnap = await admin
				.firestore()
				.collection("users")
				.doc(userUid)
				.get();

			if (!docSnap.exists) {
				return res
					.status(404)
					.json({ message: "User data does not exists." });
			}

			const data = docSnap.data() as UserData;
			if (data.role !== Roles.ADMIN) {
				res.status(401).json({ message: "Unauthorized user." });
			}

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

export default raids;
