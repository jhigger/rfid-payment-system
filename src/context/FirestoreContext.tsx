import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

type UserData = {
	role: "student" | "cashier" | "admin";
	disabled: boolean;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};

type StudentData = {
	firstName: string;
	middleName: string;
	lastName: string;
	course: string;
	year: string;
	idNumber: string;
	email: string;
	mobileNumber: string;
	address: string;
	credits: number;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};

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
			} as UserData);
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
			if (!currentUser) return setLoading(false)

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
