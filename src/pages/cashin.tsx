import Head from "next/head";
import { useContext, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import LogoutButton from "../components/LogoutButton";
import { AuthContext } from "../context/AuthContext";
import type { CashInData, Role } from "../context/FirestoreContext";
import {
	FirestoreContext,
	Roles,
	TransactionTypes,
} from "../context/FirestoreContext";

type CashInInputs = CashInData;

const CashInPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [formError, setFormError] = useState("");
	const { currentUser, logout } = useContext(AuthContext);
	const { currentUserData, addTransaction } = useContext(FirestoreContext);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<CashInInputs>();

	const onSubmit: SubmitHandler<CashInInputs> = ({ receiver, amount }) => {
		if (!currentUser) return;

		setIsLoading(true);
		setFormError("");
		addTransaction(
			TransactionTypes.CASH_IN,
			amount,
			currentUserData.idNumber,
			receiver
		)
			.then(() => {
				alert("Funds added successfully!");
				reset();
			})
			.catch((err) => {
				setFormError(err.message);
			})
			.finally(() => setIsLoading(false));
	};

	const handleLogout = () => {
		logout().catch((err) => console.log(err.message));
	};

	const authorizedUsers: Role[] = [Roles.ADMIN, Roles.CASHIER];
	if (!authorizedUsers.includes(currentUserData.role)) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
					Authorized Users Only
				</h1>
				<LogoutButton handleLogout={handleLogout} />
			</main>
		);
	}

	return (
		<>
			<Head>
				<title>RFID Payment System | Cash In</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<div className="flex max-w-md flex-col rounded-lg bg-white px-4 py-8 shadow dark:bg-gray-800 sm:px-6 md:px-8 lg:px-10">
					<div className="mb-2 self-center text-xl font-light text-gray-800 dark:text-white sm:text-2xl">
						Add funds to account
					</div>
					<div className="mt-8 p-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Receiver ID Number"
										{...register("receiver", {
											required: "Field is required",
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.receiver &&
											errors.receiver.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="number"
										min="1"
										step="1"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Amount"
										{...register("amount", {
											required: "Field is required",
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.amount && errors.amount.message}
									</span>
								</div>
							</div>
							<div className="my-4 flex w-full">
								<button
									type="submit"
									className="w-full rounded-lg  bg-purple-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2  focus:ring-offset-purple-200 "
									disabled={isLoading}
								>
									{isLoading ? (
										<FaSpinner className="mr-2 inline animate-spin" />
									) : (
										"Cash-in"
									)}
								</button>
							</div>
							<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
								{formError}
							</span>
						</form>
					</div>
				</div>
			</main>
		</>
	);
};

export default CashInPage;