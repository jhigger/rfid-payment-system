import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import type { Role } from "../context/FirestoreContext";
import { FirestoreContext, Roles } from "../context/FirestoreContext";

const Home: NextPage = () => {
	const router = useRouter();
	const { currentUser, logout } = useContext(AuthContext);
	const { userData } = useContext(FirestoreContext);

	const handleLogout = () => {
		logout().catch((err) => console.log(err.message));
	};

	if (!currentUser) {
		router.push("/login");
		return null;
	}

	if (userData.disabled) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
					Account Disabled
				</h1>
				<button
					type="button"
					className="flex w-max items-center justify-center rounded-lg  bg-red-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2  focus:ring-offset-red-200 "
					onClick={handleLogout}
				>
					<FaSignOutAlt className="mr-2" />
					Logout
				</button>
			</main>
		);
	}

	const authorized: Role[] = [Roles.ADMIN, Roles.CASHIER];
	if (!authorized.includes(userData.role)) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
					Admin/Cashier Only
				</h1>
				<button
					type="button"
					className="flex w-max items-center justify-center rounded-lg  bg-red-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2  focus:ring-offset-red-200 "
					onClick={handleLogout}
				>
					<FaSignOutAlt className="mr-2" />
					Logout
				</button>
			</main>
		);
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
					{`Hello, ${currentUser.email}!`}
				</h1>
				<h2 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
					{`Role: ${userData.role}`}
				</h2>
				<button
					type="button"
					className="flex w-max items-center justify-center rounded-lg  bg-red-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2  focus:ring-offset-red-200 "
					onClick={handleLogout}
				>
					<FaSignOutAlt className="mr-2" />
					Logout
				</button>
				<Link href="/register">
					<button
						type="button"
						className="flex w-max items-center justify-center rounded-lg  bg-blue-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2  focus:ring-offset-blue-200 "
					>
						<FaUserCircle className="mr-2" />
						Create an account
					</button>
				</Link>
			</main>
		</>
	);
};

export default Home;
