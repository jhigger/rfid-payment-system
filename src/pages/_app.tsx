import { type AppType } from "next/dist/shared/lib/utils";
import { FirestoreProvider } from "../context/FirestoreContext";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<FirestoreProvider>
			<Component {...pageProps} />
		</FirestoreProvider>
	);
};

export default MyApp;
