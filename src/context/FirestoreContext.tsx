import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

type User = { data: { [x: string]: string } };

interface ContextValues {
	user: User;
	addUser: (uid: string) => Promise<void> | undefined;
}

const FirestoreContext = createContext<ContextValues>({} as ContextValues);

const FirestoreProvider = ({ children }: { children: JSX.Element | null }) => {
	const [user, setUser] = useState<User>({} as User);
	const [loading, setLoading] = useState(true);
	const { currentUser } = useContext(AuthContext);

	const addUser = async (uid: string) => {
		try {
			const res = await setDoc(doc(db, "users", uid), {
				name: "name",
				role: "student",
			});
			return console.log(res);
		} catch (err) {
			return console.log(err);
		}
	};

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

	const value = { user, addUser };

	return (
		<FirestoreContext.Provider value={value}>
			{!loading && children}
		</FirestoreContext.Provider>
	);
};

export { FirestoreContext, FirestoreProvider };
