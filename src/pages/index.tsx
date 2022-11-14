import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { FirestoreContext } from "../context/FirestoreContext";

const Home: NextPage = () => {
	const router = useRouter();
	const { user } = useContext(FirestoreContext);
	const { currentUser, logout } = useContext(AuthContext);

	const handleLogout = () => {
		logout().catch((err) => console.log(err.message));
	};

	if (!currentUser) {
		router.push("/login");
		return null;
	}

	return (
		<>
			<Head>
				<title>RFID Payment System</title>
				<meta
					name="description"
					content="Payment system using RFID technology"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
					{`Hello, ${user.data.name}!`}
				</h1>
				<h2 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
					{`Role: ${user.data.role}`}
				</h2>
				<button
					type="button"
					className="flex w-max items-center justify-center rounded-lg  bg-red-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2  focus:ring-offset-red-200 "
					onClick={handleLogout}
				>
					<FaSignOutAlt className="mr-2" />
					Logout
				</button>
			</main>
		</>
	);
};

export default Home;
