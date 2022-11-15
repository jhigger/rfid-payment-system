import type { CollectionReference } from "firebase/firestore";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

type Pin = [number, number, number, number, number, number];
type Role = "student" | "faculty" | "cashier" | "admin";

export interface UserData {
	email: string;
	firstName: string;
	middleName: string | null;
	lastName: string;
	mobileNumber: string;
	address: string;
	funds: number;
	idNumber: string;
	pin: Pin;
	role: Role;
	disabled: boolean;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

type TransactionType = "send" | "receive" | "cash in";

interface Transaction {
	type: TransactionType;
	transaction: CollectionReference;
}

interface StudentData {
	transactions: Transaction;
	transactionCount: number;
	course: string;
	year: string;
}

interface ContextValues {
	userData: UserData;
	addUser: (uid: string) => Promise<void> | undefined;
	addStudent: (uid: string) => Promise<void> | undefined;
}

const FirestoreContext = createContext<ContextValues>({} as ContextValues);

const FirestoreProvider = ({ children }: { children: JSX.Element | null }) => {
	const [userData, setUserData] = useState<UserData>({} as UserData);
	const [loading, setLoading] = useState(true);
	const { currentUser } = useContext(AuthContext);

	const addUser = async (uid: string) => {
		try {
			await setDoc(doc(db, "users", uid), {
				role: "student",
				disabled: false,
				updatedAt: Timestamp.fromDate(new Date()),
				createdAt: Timestamp.fromDate(new Date()),
			});
		} catch (err) {
			return console.log("addUser", err);
		}
	};

	const addStudent = async (uid: string) => {
		try {
			await setDoc(doc(db, "students", uid), {
				// name: "name",
				// role: "student",
			} as StudentData);
		} catch (err) {
			return console.log("addUser", err);
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
