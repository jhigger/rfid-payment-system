import type { NextApiRequest, NextApiResponse } from "next";
import admin from "../../../../lib/firebase-admin";

const userTransactions = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "GET") {
			// Process a GET request
			const { idNumber } = req.query;
			const userDocSnap = await admin
				.firestore()
				.collection("users")
				.where("idNumber", "==", idNumber)
				.get();
			// check if id number exists
			if (!userDocSnap.docs[0]?.exists) {
				return res
					.status(404)
					.json({ message: "User data does not exists." });
			}
			// get transactions references of user
			const userId = userDocSnap.docs[0].id;
			const transactionReferences = await admin
				.firestore()
				.collection("users")
				.doc(userId as string)
				.collection("transactions")
				.get()
				.then((res) => {
					return res.docs.map((doc) => {
						return admin
							.firestore()
							.collection("transactions")
							.doc(doc.data().transaction);
					});
				});
			// check if user has transactions
			if (transactionReferences.length === 0) {
				return res.status(200).json([]);
			}
			// get all transactions based on transaction references of user
			const transactions = await admin
				.firestore()
				.getAll(...transactionReferences)
				.then((res) => res.map((doc) => doc.data()));

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

export default userTransactions;
