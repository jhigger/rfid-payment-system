import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	type User,
	type UserCredential
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";

interface AuthValues {
	currentUser: User | null;
	signup: (email: string, password: string) => Promise<UserCredential>;
	login: (email: string, password: string) => Promise<UserCredential>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValues>({} as AuthValues);

const AuthProvider = ({ children }: { children: JSX.Element | null }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const signup = (email: string, password: string) => {
		return createUserWithEmailAndPassword(auth, email, password);
	};

	const login = (email: string, password: string) => {
		return signInWithEmailAndPassword(auth, email, password);
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

	const value = {
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
