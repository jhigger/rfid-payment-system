import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import LogoutButton from "../../components/LogoutButton";
import { AuthContext } from "../../context/AuthContext";
import type { Role, UserData } from "../../context/FirestoreContext";
import { FirestoreContext, Roles } from "../../context/FirestoreContext";

type SearchInputs = { idNumber: string };

const SearchUserPage = () => {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [formError, setFormError] = useState("");
	const { currentUser, logout } = useContext(AuthContext);
	const { currentUserData } = useContext(FirestoreContext);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SearchInputs>();

	const onSubmit: SubmitHandler<SearchInputs> = ({ idNumber }) => {
		if (!currentUser) return;

		setIsLoading(true);
		setFormError("");

		axios
			.get(`/api/user/${idNumber}`)
			.then((res) => {
				const data = res.data as UserData;
				alert(
					`User balance: ${Number(data.funds).toLocaleString(
						"en-PH",
						{
							currency: "PHP",
							style: "currency",
						}
					)}`
				);
			})
			.catch((err) => {
				console.log(err);
				setFormError("ID Number not found.");
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
				<title>UC Pay | Search Balance</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<div className="flex max-w-md flex-col rounded-lg bg-[#0D2A21] px-4 py-8 shadow sm:px-6 md:px-8 lg:px-10">
					<div className="mb-2 self-center text-xl font-light text-gray-800 dark:text-white sm:text-2xl">
						Search User Balance
					</div>
					<div className="mt-8 p-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="User ID Number"
										{...register("idNumber", {
											required: "Field is required",
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.idNumber &&
											errors.idNumber.message}
									</span>
								</div>
							</div>
							<div className="my-4 flex w-full">
								<button
									type="submit"
									className="w-full rounded-lg  bg-[#02A66D] py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-[#006400] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2  focus:ring-offset-purple-200 "
									disabled={isLoading}
								>
									{isLoading ? (
										<FaSpinner className="mr-2 inline animate-spin" />
									) : (
										"Search"
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

export default SearchUserPage;
