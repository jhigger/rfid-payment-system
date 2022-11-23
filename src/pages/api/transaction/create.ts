import type { NextApiRequest, NextApiResponse } from "next";
import type {
	TransactionData,
	TransactionReference,
} from "../../../context/FirestoreContext";
import admin from "../../../lib/firebase-admin";
import {
	addFunds,
	addUserTransactionReference,
	getUidFromIdNumber,
	isAuthorizedUser,
} from "../../../utils/helperFunctions";

const create = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "POST") {
			// Process a POST request
			const {
				authorizedUid,
				transactionData: { type, amount, sender, receiver, message },
			}: {
				authorizedUid: string;
				transactionData: Omit<TransactionData, "createdAt">;
			} = req.body;

			await isAuthorizedUser(authorizedUid, res);

			const senderUid = await getUidFromIdNumber(sender);
			const receiverUid = await getUidFromIdNumber(receiver);
			const { id: transactionId } = await admin
				.firestore()
				.collection("transactions")
				.add({
					type,
					amount,
					sender,
					receiver,
					message,
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
				});
			const transactionReferenceData: TransactionReference = {
				type,
				transaction: transactionId,
			};

			await addUserTransactionReference(
				senderUid,
				transactionReferenceData
			);

			await addUserTransactionReference(
				receiverUid,
				transactionReferenceData
			);

			await addFunds(receiverUid, {
				amount,
				updatedAt: admin.firestore.FieldValue.serverTimestamp(),
			});

			res.status(200).json({
				transactionId,
				message: "Transaction complete.",
			});
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
