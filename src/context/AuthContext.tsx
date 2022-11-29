import {
	createUserWithEmailAndPassword,
	inMemoryPersistence,
	onAuthStateChanged,
	setPersistence,
	signInWithEmailAndPassword,
	signOut,
	type User,
	type UserCredential,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";

interface ContextValues {
	currentUser: User | null;
	signup: (email: string, password: string) => Promise<UserCredential>;
	login: (email: string, password: string) => Promise<void | UserCredential>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<ContextValues>({} as ContextValues);

const AuthProvider = ({ children }: { children: JSX.Element | null }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const signup = (email: string, password: string) => {
		return createUserWithEmailAndPassword(auth, email, password);
	};

	const login = async (email: string, password: string) => {
		return (
			setPersistence(auth, inMemoryPersistence)
				.then(() => {
					// Existing and future Auth states are now persisted in the current
					// session only. Closing the window would clear any existing state even
					// if a user forgets to sign out.
					// ...
					// New sign-in will be persisted with session persistence.
					return signInWithEmailAndPassword(auth, email, password);
				})
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.catch((error: any) => {
					// Handle Errors here.
					const errorMessage = error.message;
					console.log(errorMessage);
				})
		);
	};

	const logout = () => {
		return signOut(auth);
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setCurrentUser(user);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	const value: ContextValues = {
		currentUser,
		signup,
		login,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

const useAuth = () => {
	return useContext(AuthContext);
};

export { AuthContext, AuthProvider, useAuth };
