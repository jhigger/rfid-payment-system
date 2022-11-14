import { FirebaseError } from "firebase/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaEnvelope, FaSpinner, FaUnlock } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

type Inputs = {
	email: string;
	password: string;
};

const LoginPage = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { currentUser, login } = useContext(AuthContext);

	const {
		register,
		handleSubmit,
		// formState: { errors },
	} = useForm<Inputs>();

	const onSubmit: SubmitHandler<Inputs> = ({ email, password }) => {
		setIsLoading(true);
		login(email, password)
			.then(() => {
				router.replace("/");
			})
			.catch((err) => {
				if (err instanceof FirebaseError) {
					console.log(err.message);
				} else {
					console.log(err);
				}
			})
			.finally(() => setIsLoading(false));
	};

	if (currentUser) {
		router.push("/");
		return null;
	}

	return (
		<>
			<Head>
				<title>RFID Payment System | Login</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<div className="flex w-full max-w-md flex-col rounded-lg bg-white px-4 py-8 shadow dark:bg-gray-800 sm:px-6 md:px-8 lg:px-10">
					<div className="mb-6 self-center text-xl font-light text-gray-600 dark:text-white sm:text-2xl">
						Login To Your Account
					</div>
					<div className="mt-8">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="mb-2 flex flex-col">
								<div className="relative flex ">
									<span className="inline-flex items-center  rounded-l-md border-t border-l border-b border-gray-300 bg-white  px-3 text-sm text-gray-500 shadow-sm">
										<FaEnvelope />
									</span>
									<input
										type="email"
										className=" w-full flex-1 appearance-none rounded-r-lg border border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Your email"
										{...register("email", {
											required: true,
										})}
									/>
								</div>
							</div>
							<div className="mb-6 flex flex-col">
								<div className="relative flex ">
									<span className="inline-flex items-center  rounded-l-md border-t border-l border-b border-gray-300 bg-white  px-3 text-sm text-gray-500 shadow-sm">
										<FaUnlock />
									</span>
									<input
										type="password"
										className=" w-full flex-1 appearance-none rounded-r-lg border border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Your password"
										{...register("password", {
											required: true,
										})}
									/>
								</div>
							</div>
							<div className="flex w-full">
								<button
									type="submit"
									className="w-full rounded-lg  bg-purple-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2  focus:ring-offset-purple-200 "
									disabled={isLoading}
								>
									{isLoading ? (
										<FaSpinner className="mr-2 inline animate-spin" />
									) : (
										"Login"
									)}
								</button>
							</div>
						</form>
					</div>
					<div className="mt-6 flex items-center justify-center">
						<Link
							href="/register"
							className="inline-flex items-center text-center text-xs font-thin text-gray-500 hover:text-gray-700 dark:text-gray-100 dark:hover:text-white"
						>
							<span className="ml-2">
								You don&#x27;t have an account?
							</span>
						</Link>
					</div>
				</div>
			</main>
		</>
	);
};

export default LoginPage;
