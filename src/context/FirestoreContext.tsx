import type { FieldValue } from "firebase/firestore";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	increment,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

export const Roles = {
	STUDENT: "student",
	FACULTY: "faculty",
	CASHIER: "cashier",
	ADMIN: "admin",
} as const;
export type Role = typeof Roles[keyof typeof Roles];
export type RoleData = StudentData | FacultyData | CashierData | AdminData;

export interface UserData {
	email: string;
	firstName: string;
	middleName: string;
	lastName: string;
	mobileNumber: string;
	address: string;
	idNumber: string;
	role: Role;
	// defaults
	disabled: boolean;
	funds: number;
	pin: string | null;
	createdAt: FieldValue;
	updatedAt: FieldValue;
	transactionCount: number;
}

export type RegisterDefaults =
	| "disabled"
	| "funds"
	| "pin"
	| "createdAt"
	| "updatedAt"
	| "transactionCount";
export type RegisterData = Omit<
	UserData & StudentData & FacultyData & CashierData & AdminData,
	RegisterDefaults
>;

export type CashInDefaults = "type" | "sender" | "message" | "createdAt";
export type CashInData = Omit<TransactionData, CashInDefaults>;

interface StudentData {
	course: string;
	year: string;
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

interface FacultyData {
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

interface CashierData {
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

interface AdminData {
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

export const TransactionTypes = {
	SEND: "send",
	RECEIVE: "receive",
	CASH_IN: "cash in",
} as const;
type TransactionType = typeof TransactionTypes[keyof typeof TransactionTypes];

interface TransactionReference {
	type: TransactionType;
	transaction: string;
}

interface TransactionData {
	type: TransactionType;
	amount: number;
	sender: string;
	receiver: string;
	message: string | null;
	createdAt: FieldValue;
}

interface ContextValues {
	currentUserData: UserData;
	addUser: (uid: string, registerData: RegisterData) => Promise<void>;
	addTransaction: (
		type: TransactionType,
		amount: number,
		senderIdNumber: string,
		receiverIdNumber: string,
		message: string | null
	) => Promise<void>;
}

const FirestoreContext = createContext<ContextValues>({} as ContextValues);

const FirestoreProvider = ({ children }: { children: JSX.Element | null }) => {
	const [currentUserData, setCurrentUserData] = useState<UserData>(
		{} as UserData
	);
	const [loading, setLoading] = useState(true);
	const { currentUser } = useContext(AuthContext);

	const addUser = async (uid: string, registerData: RegisterData) => {
		const timestamps = {
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};
		const userData: UserData = {
			email: registerData.email,
			firstName: registerData.firstName,
			middleName: registerData.middleName,
			lastName: registerData.lastName,
			mobileNumber: registerData.mobileNumber,
			address: registerData.address,
			idNumber: registerData.idNumber,
			role: registerData.role,
			// defaults
			disabled: false,
			funds: 0,
			pin: null,
			transactionCount: 0,
			...timestamps,
		};
		// add to users table
		await setDoc(doc(db, "users", uid), userData);
		// add to respective role table
		switch (registerData.role) {
			case Roles.STUDENT:
				const studentData: StudentData = {
					course: registerData.course,
					year: registerData.year,
					...timestamps,
				};
				addToRole(Roles.STUDENT, uid, studentData);
				break;
			case Roles.FACULTY:
				const facultyData: FacultyData = { ...timestamps };
				addToRole(Roles.FACULTY, uid, facultyData);
				break;
			case Roles.CASHIER:
				const cashierData: CashierData = { ...timestamps };
				addToRole(Roles.CASHIER, uid, cashierData);
				break;
			case Roles.ADMIN:
				const adminData: AdminData = { ...timestamps };
				addToRole(Roles.ADMIN, uid, adminData);
				break;
			default:
				break;
		}
	};

	const addToRole = async (
		collection: Role,
		uid: string,
		roleData: RoleData
	) => {
		try {
			await setDoc(doc(db, collection, uid), { ...roleData });
		} catch (err) {
			return console.log(`add to ${collection}`, err);
		}
	};

	const addTransaction = async (
		type: TransactionType,
		amount: number,
		senderIdNumber: string,
		receiverIdNumber: string,
		message: string | null
	) => {
		const timestamps = {
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};
		const transactionData: TransactionData = {
			type,
			amount,
			sender: senderIdNumber,
			receiver: receiverIdNumber,
			message,
			createdAt: timestamps.createdAt,
		};
		// get UIDs
		const senderUid = await getUidFromIdNumber(senderIdNumber);
		const receiverUid = await getUidFromIdNumber(receiverIdNumber);
		// transaction stops if error finding user from id number
		const { id: transactionId } = await addDoc(
			collection(db, "transactions"),
			transactionData
		);
		const transactionReferenceData: TransactionReference = {
			type,
			transaction: transactionId,
		};
		// save transaction reference for each user sub collection
		// for sender
		const senderDocRef = doc(db, "users", senderUid);
		const senderColRef = collection(senderDocRef, "transactions");
		await addDoc(senderColRef, transactionReferenceData);
		// for receiver
		const receiverDocRef = doc(db, "users", receiverUid);
		const receiverColRef = collection(receiverDocRef, "transactions");
		await addDoc(receiverColRef, transactionReferenceData);
		await addFunds(receiverUid, {
			amount,
			updatedAt: timestamps.updatedAt,
		});
	};

	const addFunds = async (
		uid: string,
		{ amount, updatedAt }: { amount: number; updatedAt: FieldValue }
	) => {
		const docRef = doc(db, "users", uid);
		await updateDoc(docRef, {
			funds: increment(amount),
			updatedAt,
		});
	};

	const getUidFromIdNumber = async (idNumber: string): Promise<string> => {
		const q = query(
			collection(db, "users"),
			where("idNumber", "==", idNumber)
		);
		const docSnap = await getDocs(q);
		if (docSnap.docs[0]?.exists()) {
			return docSnap.docs[0].id;
		}
		// doc.data() will be undefined in this case
		return Promise.reject(new Error("ID number does not exist."));
	};

	useEffect(() => {
		const getUser = async () => {
			if (!currentUser) return setLoading(false);

			const docRef = doc(db, "users", currentUser.uid);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				setCurrentUserData({ ...data } as UserData);
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
			}
			setLoading(false);
		};

		getUser();
	}, [currentUser]);

	const value: ContextValues = { currentUserData, addUser, addTransaction };

	return (
		<FirestoreContext.Provider value={value}>
			{!loading && children}
		</FirestoreContext.Provider>
	);
};

export { FirestoreContext, FirestoreProvider };
