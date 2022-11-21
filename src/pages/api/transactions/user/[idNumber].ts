// import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "../../../../lib/firebase-admin";

const raids = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "GET") {
			// Process a GET request
			const { idNumber } = req.query;
			const userDocSnap = await admin
				.firestore()
				.collection("users")
				.where("idNumber", "==", idNumber)
				.get();

			if (!userDocSnap.docs[0]?.exists) {
				return res
					.status(404)
					.json({ message: "User data does not exists." });
			}

			const userId = userDocSnap.docs[0]?.id;
			const transactionReferences = await admin
				.firestore()
				.collection("users")
				.doc(userId as string)
				.collection("transactions")
				.get()
				.then((res) => {
					return res.docs.map((doc) => {
						return doc.data().transaction;
					});
				});

			if (transactionReferences.length === 0) {
				return res.status(200).json([]);
			}

			const transactions = await admin
				.firestore()
				.collection("transactions")
				.where(
					admin.firestore.FieldPath.documentId(),
					"in",
					transactionReferences
				)
				.get()
				.then((res) => res.docs.map((doc) => doc.data()));

			res.status(200).json(transactions);
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
