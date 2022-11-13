import { type NextPage } from "next";
import Head from "next/head";
import { useContext } from "react";
import { FirestoreContext } from "../context/FirestoreContext";

const Home: NextPage = () => {
	const { users } = useContext(FirestoreContext);
	const user = users[0]?.data.name;

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
					{`Hello, ${user}!`}
				</h1>
			</main>
		</>
	);
};

export default Home;
