import type { NextApiRequest, NextApiResponse } from "next";
import {
	getTransactionsFromReferences,
	getUser,
	getUserTransactionReferences,
} from "../../../../../utils/helperFunctions";

const userTransactions = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "GET") {
			// Process a GET request
			const { idNumber, limit } = req.query;
			const userDocSnap = await getUser(idNumber as string);
			// check if id number exists
			if (!userDocSnap.docs[0]?.exists) {
				return res
					.status(404)
					.json({ message: "User data does not exists." });
			}
			// get transactions references of user
			const userUid = userDocSnap.docs[0].id;
			const transactionReferences = await getUserTransactionReferences(
				userUid,
				Number(limit) || 0
			);
			// check if user has transactions
			if (transactionReferences.length === 0) {
				return res.status(200).json([]);
			}
			// get all transactions based on transaction references of user
			const transactions = await getTransactionsFromReferences(
				transactionReferences
			);

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
