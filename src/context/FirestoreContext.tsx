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
	ACCOUNTANT: "accountant",
} as const;
export type Role = typeof Roles[keyof typeof Roles];
export type RoleData =
	| StudentData
	| FacultyData
	| CashierData
	| AdminData
	| AccountantData;

export interface UserData {
	email: string;
	firstName: string;
	middleName: string;
	lastName: string;
	mobileNumber: string;
	address: string;
	idNumber: string;
	role: Role;
	cardNumber: string;
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
	UserData &
		StudentData &
		FacultyData &
		CashierData &
		AdminData &
		AccountantData,
	RegisterDefaults
>;

export type CashInDefaults = "type" | "sender" | "message" | "createdAt";
export type CashInData = Omit<TransactionData, CashInDefaults>;

export type PaymentDefaults = "type" | "receiver" | "message" | "createdAt";
export type PaymentData = Omit<TransactionData, PaymentDefaults>;

export type UpdateDefaults =
	| "funds"
	| "createdAt"
	| "updatedAt"
	| "transactionCount";
export type UpdateData = Omit<
	UserData &
		StudentData &
		FacultyData &
		CashierData &
		AdminData &
		AccountantData,
	UpdateDefaults
>;

export interface StudentData {
	course: string;
	year: string;
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

export interface FacultyData {
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

export interface CashierData {
	storeName: string;
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

export interface AdminData {
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

export interface AccountantData {
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

export const TransactionTypes = {
	SEND: "send",
	RECEIVE: "receive",
	CASH_IN: "cash in",
	PAYMENT: "payment",
} as const;
type TransactionType = typeof TransactionTypes[keyof typeof TransactionTypes];

export interface TransactionReference {
	type: TransactionType;
	transaction: string;
}

export interface TransactionData {
	type: TransactionType;
	amount: number;
	sender: string;
	receiver: string;
	message: string | null;
	createdAt: FieldValue;
}

interface ContextValues {
	currentUserData: UserData | null;
	addUser: (uid: string, registerData: RegisterData) => Promise<void>;
	addTransaction: (
		type: TransactionType,
		amount: number,
		senderIdNumber: string,
		receiverIdNumber: string,
		message: string | null
	) => Promise<void>;
	getUidFromIdNumber: (idNumber: string) => Promise<string>;
	getUser: (idNumber: string) => Promise<UserData | undefined>;
	getRoleData: (
		role: string,
		idNumber: string
	) => Promise<
		(StudentData & FacultyData & CashierData & AdminData) | undefined
	>;
	getDataFromRFIDCardNumber: (cardNumber: string) => Promise<UserData>;
}

const FirestoreContext = createContext<ContextValues>({} as ContextValues);

const FirestoreProvider = ({ children }: { children: JSX.Element | null }) => {
	const [currentUserData, setCurrentUserData] = useState<UserData | null>(
		null
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
			cardNumber: registerData.cardNumber,
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
				await addToRole(Roles.STUDENT, uid, studentData);
				break;
			case Roles.FACULTY:
				const facultyData: FacultyData = { ...timestamps };
				await addToRole(Roles.FACULTY, uid, facultyData);
				break;
			case Roles.CASHIER:
				const cashierData: CashierData = {
					storeName: registerData.storeName,
					...timestamps,
				};
				await addToRole(Roles.CASHIER, uid, cashierData);
				break;
			case Roles.ADMIN:
				const adminData: AdminData = { ...timestamps };
				await addToRole(Roles.ADMIN, uid, adminData);
				break;
			case Roles.ACCOUNTANT:
				const accountantData: AccountantData = { ...timestamps };
				await addToRole(Roles.ACCOUNTANT, uid, accountantData);
				break;
			default:
				return Promise.reject(new Error("Invalid Role"));
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
			return Promise.reject(new Error(`add to ${collection}: ${err}`));
		}
	};

	const addTransaction = async (
		type: TransactionType,
		amount: number,
		senderIdNumber: string,
		receiverIdNumber: string,
		message: string | null
	) => {
		// get UIDs
		const senderUid = await getUidFromIdNumber(senderIdNumber);
		const receiverUid = await getUidFromIdNumber(receiverIdNumber);

		if (type === TransactionTypes.PAYMENT) {
			const funds = await getFunds(senderUid);
			if (funds < amount) {
				return Promise.reject(new Error("Insufficient funds."));
			}
		}

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
		// transaction stops if error finding user from id number
		const { id: transactionId } = await addDoc(
			collection(db, "transactions"),
			transactionData
		);

		// save transaction reference for each user sub collection
		// for sender
		const senderDocRef = doc(db, "users", senderUid);
		const senderColRef = collection(senderDocRef, "transactions");
		await addDoc(senderColRef, {
			type: TransactionTypes.SEND,
			transaction: transactionId,
		});
		if (type === TransactionTypes.PAYMENT) {
			await updateFunds(senderUid, {
				amount: -amount,
				updatedAt: timestamps.updatedAt,
			});
		}
		// for receiver
		const receiverDocRef = doc(db, "users", receiverUid);
		const receiverColRef = collection(receiverDocRef, "transactions");
		await addDoc(receiverColRef, {
			type: TransactionTypes.RECEIVE,
			transaction: transactionId,
		});
		await updateFunds(receiverUid, {
			amount,
			updatedAt: timestamps.updatedAt,
		});
	};

	const updateFunds = async (
		uid: string,
		{ amount, updatedAt }: { amount: number; updatedAt: FieldValue }
	) => {
		const docRef = doc(db, "users", uid);
		await updateDoc(docRef, {
			funds: increment(amount),
			transactionCount: increment(1),
			updatedAt,
		});
	};

	const getFunds = async (uid: string) => {
		const docRef = doc(db, "users", uid);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data() as UserData;
			return data.funds;
		} else {
			// doc.data() will be undefined in this case
			return 0;
		}
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

	const getDataFromRFIDCardNumber = async (
		cardNumber: string
	): Promise<UserData> => {
		const q = query(
			collection(db, "users"),
			where("cardNumber", "==", cardNumber)
		);
		const docSnap = await getDocs(q);
		if (docSnap.docs[0]?.exists()) {
			return docSnap.docs[0].data() as UserData;
		}
		// doc.data() will be undefined in this case
		return Promise.reject(new Error("RFID card number does not exist."));
	};

	const getUser = async (idNumber: string) => {
		const uid = await getUidFromIdNumber(idNumber);
		const docRef = doc(db, "users", uid);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			return { ...data } as UserData;
		} else {
			// doc.data() will be undefined in this case
			return Promise.reject(new Error("ID number does not exist."));
		}
	};

	const getRoleData = async (role: string, idNumber: string) => {
		const uid = await getUidFromIdNumber(idNumber);
		const docRef = doc(db, role, uid);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			return { ...data } as StudentData &
				FacultyData &
				CashierData &
				AdminData;
		} else {
			// doc.data() will be undefined in this case
			console.log("No such document!");
		}
	};

	useEffect(() => {
		const getCurrentUser = async () => {
			if (!currentUser) return setCurrentUserData(null);

			const docRef = doc(db, "users", currentUser.uid);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				setCurrentUserData({ ...data } as UserData);
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
			}
		};

		getCurrentUser().finally(() => setLoading(false));
	}, [currentUser]);

	const value: ContextValues = {
		currentUserData,
		addUser,
		addTransaction,
		getUidFromIdNumber,
		getUser,
		getRoleData,
		getDataFromRFIDCardNumber,
	};

	return (
		<FirestoreContext.Provider value={value}>
			{!loading && children}
		</FirestoreContext.Provider>
	);
};

export { FirestoreContext, FirestoreProvider };
