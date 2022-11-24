import type { NextApiRequest, NextApiResponse } from "next";
import type { UserData } from "../../../../context/FirestoreContext";
import admin from "../../../../lib/firebase-admin";
import { getUser, isAuthorizedUser } from "../../../../utils/helperFunctions";

const update = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "PUT") {
			// Process a PUT request
			const {
				authorizedUid,
				idNumber,
				userData: {
					firstName,
					middleName,
					lastName,
					mobileNumber,
					address,
					disabled,
					pin,
				},
			}: {
				authorizedUid: string;
				idNumber: string;
				userData: Partial<UserData>;
			} = req.body;
			// check if user updating the db is an admin
			await isAuthorizedUser(authorizedUid, res);
			// check if user to be updated exists
			const userDocSnap = await getUser(idNumber);
			if (!userDocSnap.docs[0]?.exists) {
				return res
					.status(404)
					.json({ message: "User data does not exists." });
			}
			// filter for only listed properties
			const updates = Object.fromEntries(
				Object.entries({
					firstName,
					middleName,
					lastName,
					mobileNumber,
					address,
					disabled,
					pin,
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
				}).filter(([_, v]) => v != null)
			);
			// update user doc
			const userUid = userDocSnap.docs[0].id;
			const user = await admin
				.firestore()
				.collection("users")
				.doc(userUid)
				.update({
					...updates,
					updatedAt: admin.firestore.FieldValue.serverTimestamp(),
				});

			res.status(200).json({ message: "Update complete.", ...user });
		} else {
			// Handle any other HTTP method
			res.status(200).json({ name: "Hello, world!" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

export default update;
