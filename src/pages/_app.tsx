import { type AppType } from "next/dist/shared/lib/utils";
import { AuthProvider } from "../context/AuthContext";
import { FirestoreProvider } from "../context/FirestoreContext";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<AuthProvider>
			<FirestoreProvider>
				<Component {...pageProps} />
			</FirestoreProvider>
		</AuthProvider>
	);
};

export default MyApp;
