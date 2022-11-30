import type { NextApiResponse } from "next";
import type {
	Role,
	TransactionReference,
	UserData,
} from "../context/FirestoreContext";
import { Roles } from "../context/FirestoreContext";
import admin from "../lib/firebase-admin";

export const isAuthorizedUser = async (
	authorizedUid: string,
	res: NextApiResponse
) => {
	const docSnap = await admin
		.firestore()
		.collection("users")
		.doc(authorizedUid)
		.get();

	if (!docSnap.exists) {
		return res.status(404).json({ message: "User data does not exists." });
	}

	const data = docSnap.data() as UserData;
	if (data.role !== Roles.ADMIN) {
		res.status(401).json({ message: "Unauthorized user." });
	}
};

export const getUidFromIdNumber = async (idNumber: string): Promise<string> => {
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

export const addFunds = async (
	uid: string,
	{
		amount,
		updatedAt,
	}: { amount: number; updatedAt: admin.firestore.FieldValue }
) => {
	return await admin
		.firestore()
		.collection("users")
		.doc(uid)
		.update({
			funds: admin.firestore.FieldValue.increment(amount),
			transactionCount: admin.firestore.FieldValue.increment(1),
			updatedAt,
		});
};

export const getUser = async (idNumber: string) => {
	return await admin
		.firestore()
		.collection("users")
		.where("idNumber", "==", idNumber)
		.get();
};

export const getFromRole = async (uid: string, role: Role) => {
	return await admin.firestore().collection(role).doc(uid).get();
};

export const addUserTransactionReference = async (
	userUid: string,
	transactionReferenceData: TransactionReference
) => {
	return await admin
		.firestore()
		.collection("users")
		.doc(userUid)
		.collection("transactions")
		.add(transactionReferenceData);
};

export const getUserTransactionReferences = async (
	userUid: string,
	limit: number
) => {
	return await admin
		.firestore()
		.collection("users")
		.doc(userUid)
		.collection("transactions")
		.limit(limit)
		.get()
		.then((res) => {
			return res.docs.map((doc) => {
				return admin
					.firestore()
					.collection("transactions")
					.doc(doc.data().transaction);
			});
		});
};

export const getTransactionsFromReferences = async (
	transactionReferences: admin.firestore.DocumentReference<admin.firestore.DocumentData>[]
) => {
	return await admin
		.firestore()
		.getAll(...transactionReferences)
		.then((res) => res.map((doc) => doc.data()));
};
