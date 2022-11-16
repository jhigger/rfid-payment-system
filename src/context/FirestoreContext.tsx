import type { CollectionReference } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

export enum Roles {
	student,
	faculty,
	cashier,
	admin,
}
export type Role = keyof typeof Roles;
export type RoleData = StudentData;

export type RegisterDefaults =
	| "disabled"
	| "funds"
	| "pin"
	| "createdAt"
	| "updatedAt"
	| "transactions"
	| "transactionCount";
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
	createdAt: Timestamp;
	updatedAt: Timestamp;
	transactions: TransactionReference[];
	transactionCount: number;
}

type TransactionType = "send" | "receive" | "cash in";

interface TransactionReference {
	type: TransactionType;
	transaction: CollectionReference;
}

export interface StudentData {
	course: string;
	year: string;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

interface ContextValues {
	userData: UserData;
	addUser: (
		uid: string,
		userData: Omit<UserData & RoleData, RegisterDefaults>
	) => Promise<void> | undefined;
}

const FirestoreContext = createContext<ContextValues>({} as ContextValues);

const FirestoreProvider = ({ children }: { children: JSX.Element | null }) => {
	const [userData, setUserData] = useState<UserData>({} as UserData);
	const [loading, setLoading] = useState(true);
	const { currentUser } = useContext(AuthContext);

	const addUser = async (
		uid: string,
		userData: Omit<UserData & RoleData, RegisterDefaults>
	) => {
		try {
			const docData: Omit<UserData & RoleData, "transactions"> = {
				disabled: false,
				funds: 0,
				pin: null,
				transactionCount: 0,
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
				...userData,
			};
			await setDoc(doc(db, "users", uid), docData);
			const { role, course, year } = userData;
			const { createdAt, updatedAt } = docData;
			switch (role) {
				case Roles[0]:
					const studentData = { course, year, createdAt, updatedAt };
					addStudent(uid, studentData);
					break;
				default:
					break;
			}
		} catch (err) {
			return console.log("addUser", err);
		}
	};

	const addStudent = async (uid: string, studentData: StudentData) => {
		try {
			await setDoc(doc(db, "students", uid), { ...studentData });
		} catch (err) {
			return console.log("addStudent", err);
		}
	};

	useEffect(() => {
		const getUser = async () => {
			if (!currentUser) return setLoading(false);

			const docRef = doc(db, "users", currentUser.uid);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				setUserData({
					role: data.role,
					disabled: data.disabled,
					createdAt: data.createdAt,
					updatedAt: data.updatedAt,
				} as UserData);
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
			}
			setLoading(false);
		};

		getUser();
	}, [currentUser]);

	const value = { userData, addUser, addStudent };

	return (
		<FirestoreContext.Provider value={value}>
			{!loading && children}
		</FirestoreContext.Provider>
	);
};

export { FirestoreContext, FirestoreProvider };
