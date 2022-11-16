import { FirebaseError } from "firebase/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import type {
	RegisterDefaults,
	Role,
	RoleData,
	UserData,
} from "../context/FirestoreContext";
import { FirestoreContext, Roles } from "../context/FirestoreContext";

interface RegisterInputs extends Omit<UserData & RoleData, RegisterDefaults> {
	password: string;
	confirmPassword: string;
}

type RegisterSubmit = Omit<RegisterInputs, "confirmPassword">;

const RegisterPage = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { currentUser, signup } = useContext(AuthContext);
	const { addUser } = useContext(FirestoreContext);

	const {
		register,
		handleSubmit,
		watch,
		// formState: { errors },
	} = useForm<RegisterInputs>();

	const onSubmit: SubmitHandler<RegisterSubmit> = ({
		email,
		password,
		role,
		...rest
	}) => {
		setIsLoading(true);
		signup(email, password)
			.then((res) => {
				const uid = res.user.uid;
				// generate defaults
				const userData: Omit<RegisterSubmit, "password"> = {
					email,
					role,
					...rest,
				};
				// add to user table
				addUser(uid, userData);
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

	// if (userData.role !== "admin") {
	// 	return (
	// 		<div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
	// 			<h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
	// 				Admin Only
	// 			</h1>
	// 		</div>
	// 	);
	// }

	return (
		<>
			<Head>
				<title>RFID Payment System | Register</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<div className="flex max-w-md flex-col rounded-lg bg-white px-4 py-8 shadow dark:bg-gray-800 sm:px-6 md:px-8 lg:px-10">
					<div className="mb-2 self-center text-xl font-light text-gray-800 dark:text-white sm:text-2xl">
						Create a new account
					</div>
					<span className="flex-items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
						Already have an account ?{" "}
						<Link
							href="/login"
							className="text-sm text-blue-500 underline hover:text-blue-700"
						>
							Login
						</Link>
					</span>

					<div className="mt-8 p-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<select
										className="focus:ring-primary-500 focus:border-primary-500 block w-52 rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-700 shadow-sm focus:outline-none"
										{...register("role", {
											required: true,
										})}
									>
										{(
											Object.keys(Roles).filter((el) => {
												return isNaN(Number(el));
											}) as Array<Role>
										).map((item) => {
											return (
												<option key={item} value={item}>
													{item}
												</option>
											);
										})}
									</select>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="ID Number"
										{...register("idNumber", {
											required: true,
										})}
									/>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="First Name"
										{...register("firstName", {
											required: true,
										})}
									/>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Middle Name"
										{...register("middleName", {
											required: true,
										})}
									/>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Last Name"
										{...register("lastName", {
											required: true,
										})}
									/>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Mobile Number (09876543210)"
										{...register("mobileNumber", {
											required: true,
											//TODO: add regex pattern
										})}
									/>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Home Address"
										{...register("address", {
											required: true,
										})}
									/>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="email"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Email"
										{...register("email", {
											required: true,
										})}
									/>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="password"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Confirm Password"
										{...register("confirmPassword", {
											required: true,
											minLength: 6,
										})}
									/>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="password"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Password"
										{...register("password", {
											required: true,
											validate: (val: string) => {
												if (watch("password") != val) {
													return "Your passwords do no match";
												}
											},
										})}
									/>
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
										"Register"
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			</main>
		</>
	);
};

export default RegisterPage;
