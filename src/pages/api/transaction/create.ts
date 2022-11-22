// import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import type {
	TransactionData,
	TransactionReference,
	UserData,
} from "../../../context/FirestoreContext";
import { Roles } from "../../../context/FirestoreContext";
import admin from "../../../lib/firebase-admin";

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

			const docSnap = await admin
				.firestore()
				.collection("users")
				.doc(authorizedUid)
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

			await admin
				.firestore()
				.collection("users")
				.doc(senderUid)
				.collection("transactions")
				.add(transactionReferenceData);

			await admin
				.firestore()
				.collection("users")
				.doc(receiverUid)
				.collection("transactions")
				.add(transactionReferenceData);

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

const getUidFromIdNumber = async (idNumber: string): Promise<string> => {
	const docSnap = await admin
		.firestore()
		.collection("users")
		.where("idNumber", "==", idNumber)
		.get();
	if (docSnap.docs[0]?.exists) {
		return docSnap.docs[0].id;
	}
	return Promise.reject(new Error("ID number does not exist."));
};

const addFunds = async (
	uid: string,
	{
		amount,
		updatedAt,
	}: { amount: number; updatedAt: admin.firestore.FieldValue }
) => {
	await admin
		.firestore()
		.collection("users")
		.doc(uid)
		.update({
			funds: admin.firestore.FieldValue.increment(amount),
			updatedAt,
		});
};

export default create;
