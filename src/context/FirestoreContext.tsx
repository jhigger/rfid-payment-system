import type { CollectionReference } from "firebase/firestore";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
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

export type RegisterData = Omit<
	UserData & StudentData & FacultyData & CashierData & AdminData,
	RegisterDefaults
>;

type TransactionType = "send" | "receive" | "cash in";

interface TransactionReference {
	type: TransactionType;
	transaction: CollectionReference;
}

interface StudentData {
	course: string;
	year: string;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

interface FacultyData {
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

interface CashierData {
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

interface AdminData {
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

interface ContextValues {
	currentUserData: UserData;
	addUser: (
		uid: string,
		registerData: RegisterData
	) => Promise<void> | undefined;
}

const FirestoreContext = createContext<ContextValues>({} as ContextValues);

const FirestoreProvider = ({ children }: { children: JSX.Element | null }) => {
	const [currentUserData, setCurrentUserData] = useState<UserData>(
		{} as UserData
	);
	const [loading, setLoading] = useState(true);
	const { currentUser } = useContext(AuthContext);

	const addUser = async (uid: string, registerData: RegisterData) => {
		try {
			const userData: Omit<UserData, "transactions"> = {
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
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			};
			await setDoc(doc(db, "users", uid), userData);
			switch (registerData.role) {
				case Roles.STUDENT:
					const studentData: StudentData = {
						course: registerData.course,
						year: registerData.year,
						createdAt: userData.createdAt,
						updatedAt: userData.updatedAt,
					};
					addToRole(Roles.STUDENT, uid, studentData);
					break;
				case Roles.FACULTY:
					const facultyData: FacultyData = {
						createdAt: userData.createdAt,
						updatedAt: userData.updatedAt,
					};
					addToRole(Roles.FACULTY, uid, facultyData);
					break;
				case Roles.CASHIER:
					const cashierData: CashierData = {
						createdAt: userData.createdAt,
						updatedAt: userData.updatedAt,
					};
					addToRole(Roles.CASHIER, uid, cashierData);
					break;
				case Roles.ADMIN:
					const adminData: AdminData = {
						createdAt: userData.createdAt,
						updatedAt: userData.updatedAt,
					};
					addToRole(Roles.ADMIN, uid, adminData);
					break;
				default:
					break;
			}
		} catch (err) {
			return console.log("addUser", err);
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

	useEffect(() => {
		const getUser = async () => {
			if (!currentUser) return setLoading(false);

			const docRef = doc(db, "users", currentUser.uid);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				setCurrentUserData({
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

	const value: ContextValues = { currentUserData, addUser };

	return (
		<FirestoreContext.Provider value={value}>
			{!loading && children}
		</FirestoreContext.Provider>
	);
};

export { FirestoreContext, FirestoreProvider };
