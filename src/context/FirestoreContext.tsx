import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

type User = { data: { [x: string]: string } };

interface ContextValues {
	user: User;
}

const FirestoreContext = createContext<ContextValues>({} as ContextValues);

const FirestoreProvider = ({ children }: { children: JSX.Element | null }) => {
	const [user, setUser] = useState<User>({} as User);
	const [loading, setLoading] = useState(true);

	const { currentUser } = useContext(AuthContext);

	useEffect(() => {
		const getUser = async () => {
			if (!currentUser) return;

			const docRef = doc(db, "users", currentUser.uid);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				setUser({
					data: {
						...docSnap.data(),
					},
				});
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
			}

			setLoading(false);
		};

		getUser();
	}, [currentUser]);

	const value = { user };

	return (
		<FirestoreContext.Provider value={value}>
			{!loading && children}
		</FirestoreContext.Provider>
	);
};

export { FirestoreContext, FirestoreProvider };
