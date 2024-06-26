import QRCode from "qrcode";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import LogoutButton from "../components/LogoutButton";
import { AuthContext } from "../context/AuthContext";
import type { PaymentData, Role } from "../context/FirestoreContext";
import {
	FirestoreContext,
	Roles,
	TransactionTypes,
} from "../context/FirestoreContext";

interface PaymentInputs extends PaymentData {
	pin: string;
}

const PaymentPage = () => {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [formError, setFormError] = useState("");
	const { currentUser, logout } = useContext(AuthContext);
	const { currentUserData, addTransaction, getDataFromRFIDCardNumber } =
		useContext(FirestoreContext);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<PaymentInputs>();

	const onSubmit: SubmitHandler<PaymentInputs> = ({
		sender,
		amount,
		pin,
	}) => {
		if (!currentUser || !currentUserData) return;

		setIsLoading(true);
		setFormError("");
		getDataFromRFIDCardNumber(sender)
			.then((senderUserData) => {
				if (senderUserData.pin === null) senderUserData.pin = "";
				if (senderUserData.pin !== pin) {
					setFormError("Pin does not match");
					return;
				}

				addTransaction(
					TransactionTypes.PAYMENT,
					amount,
					senderUserData.idNumber,
					currentUserData.idNumber,
					"Payment"
				)
					.then(() => {
						alert("Paid successfully!");
						reset();
					})
					.catch((err) => {
						setFormError(err.message);
					});
			})
			.catch((err) => {
				setFormError(err.message);
			})
			.finally(() => setIsLoading(false));
	};

	const handleLogout = () => {
		logout().catch((err) => console.log(err.message));
	};

	useEffect(() => {
		if (!currentUser) {
			router.push("/login");
		}
	}, [currentUser, router]);

	if (!currentUserData) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-[#0D2A21] md:text-[5rem]">
					Loading...
				</h1>
			</main>
		);
	}

	const authorizedUsers: Role[] = [Roles.CASHIER];
	if (!authorizedUsers.includes(currentUserData.role)) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-[#0D2A21] md:text-[5rem]">
					Authorized Users Only
				</h1>
				<LogoutButton handleLogout={handleLogout} />
			</main>
		);
	}

	return (
		<>
			<Head>
				<title>UC Pay | Pay</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<div className="flex w-max flex-col rounded-lg bg-[#0D2A21] px-4 py-8 shadow sm:px-6 md:px-8 lg:px-10">
					<div className="mb-2 self-center text-xl font-light text-gray-800 dark:text-white sm:text-2xl">
						Payment Transaction
					</div>
					<div className="mt-8 flex gap-4 divide-x p-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="number"
										min="1"
										step="1"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="password"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Payer RFID Card Number"
										maxLength={10}
										{...register("sender", {
											required: "Field is required",
											maxLength: 10,
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.sender && errors.sender.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="password"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Pin (optional)"
										{...register("pin", {
											required: "Field is required",
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.pin && errors.pin.message}
									</span>
								</div>
							</div>
							<div className="my-4 flex w-full">
								<button
									type="submit"
									className="w-full rounded-lg bg-[#02A66D] py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-[#006400] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2  focus:ring-offset-purple-200 "
									disabled={isLoading}
								>
									{isLoading ? (
										<FaSpinner className="mr-2 inline animate-spin" />
									) : (
										"Pay"
									)}
								</button>
							</div>
							<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
								{formError}
							</span>
						</form>
						<QRCodeImage idNumber={currentUserData.idNumber} />
					</div>
				</div>
			</main>
		</>
	);
};

const generateQR = (idNumber: string) => {
	return QRCode.toCanvas(document.getElementById("canvas"), idNumber);
};

const QRCodeImage = ({ idNumber }: { idNumber: string }) => {
	generateQR(idNumber);
	return (
		<div className="flex items-center justify-center p-8 text-white">
			<canvas id="canvas" className="h-max w-max"></canvas>
		</div>
	);
};

export default PaymentPage;
