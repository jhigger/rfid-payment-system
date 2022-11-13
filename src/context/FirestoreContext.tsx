import { collection, getDocs } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";

type User = { id: string; data: { [x: string]: string } };

interface ContextValues {
	users: User[];
}

const FirestoreContext = createContext<ContextValues>({} as ContextValues);

const FirestoreProvider = ({ children }: { children: JSX.Element | null }) => {
	const [users, setUsers] = useState<User[]>([] as User[]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getUsers = async () => {
			const querySnapshot = await getDocs(collection(db, "users"));

			setUsers(
				querySnapshot.docs.map((doc) => {
					return {
						id: doc.id,
						data: {
							...doc.data(),
						},
					};
				})
			);
			setLoading(false);
		};

		getUsers();
	}, []);

	const value = { users };

	return (
		<FirestoreContext.Provider value={value}>
			{!loading && children}
		</FirestoreContext.Provider>
	);
};

export { FirestoreContext, FirestoreProvider };
