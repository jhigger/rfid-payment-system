import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaEnvelope, FaSpinner, FaUnlock } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

interface LoginInputs {
	email: string;
	password: string;
}

const LoginPage = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formError, setFormError] = useState("");
	const { currentUser, login } = useContext(AuthContext);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginInputs>();

	const onSubmit: SubmitHandler<LoginInputs> = ({ email, password }) => {
		setIsLoading(true);
		setFormError("");
		login(email, password)
			.catch((err) => {
				setFormError(err.message);
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(() => {
		if (currentUser) {
			router.push("/");
		}
	}, [currentUser, router]);

	return (
		<>
			<Head>
				<title>RFID Payment System | Login</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<div className="flex w-full max-w-md flex-col rounded-lg bg-[#0D2A21] px-4 py-8 shadow sm:px-6 md:px-8 lg:px-10">
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
										className=" w-full flex-1 appearance-none rounded-r-lg border border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Your email"
										{...register("email", {
											required: true,
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.email && errors.email.message}
									</span>
								</div>
							</div>
							<div className="mb-6 flex flex-col">
								<div className="relative flex ">
									<span className="inline-flex items-center  rounded-l-md border-t border-l border-b border-gray-300 bg-white  px-3 text-sm text-gray-500 shadow-sm">
										<FaUnlock />
									</span>
									<input
										type="password"
										className=" w-full flex-1 appearance-none rounded-r-lg border border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Your password"
										{...register("password", {
											required: true,
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.password &&
											errors.password.message}
									</span>
								</div>
							</div>
							<div className="flex w-full">
								<button
									type="submit"
									className="w-full rounded-lg  bg-[#02A66D] py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2  focus:ring-offset-purple-200 "
									disabled={isLoading}
								>
									{isLoading ? (
										<FaSpinner className="mr-2 inline animate-spin" />
									) : (
										"Login"
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

export default LoginPage;
