// import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "../../lib/firebase-admin";

const seed = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "GET") {
			// Process a GET request
			const list = await admin.auth().listUsers();
			if (list.users.length === 0) {
				const user = {
					email: "admin@admin.admin",
					password: "admin123",
				};

				const { uid } = await admin.auth().createUser(user);
				const timestamps = {
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
					updatedAt: admin.firestore.FieldValue.serverTimestamp(),
				};
				await admin
					.firestore()
					.collection("users")
					.doc(uid)
					.create({
						email: user.email,
						firstName: "admin",
						middleName: "admin",
						lastName: "admin",
						mobileNumber: "admin",
						address: "admin",
						idNumber: "admin",
						role: "admin",

						disabled: false,
						funds: 0,
						pin: null,
						transactionCount: 0,
						...timestamps,
					});

				const adminData = { ...timestamps };
				await admin
					.firestore()
					.collection("admin")
					.doc(uid)
					.create({
						...adminData,
					});

				return res.status(200).json({ message: "DB seeded.", ...user });
			}

			res.status(200).json({
				message: "DB already seeded. Reset DB to seed again.",
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

export default seed;
