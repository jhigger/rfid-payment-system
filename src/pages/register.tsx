import type { UserRecord } from "firebase-admin/lib/auth/user-record";
import Head from "next/head";
import { useContext, useState, useEffect } from "react";
import type { FieldErrorsImpl, UseFormRegister } from "react-hook-form";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import type { RegisterData, Role } from "../context/FirestoreContext";
import { FirestoreContext, Roles } from "../context/FirestoreContext";
import axios from "axios";
import { useRouter } from "next/router";

interface RegisterInputs extends RegisterData {
	password: string;
	confirmPassword: string;
}

const RegisterPage = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formError, setFormError] = useState("");
	const [role, setRole] = useState<Role>("student");
	const { currentUser } = useContext(AuthContext);
	const { currentUserData, addUser, getUidFromIdNumber } =
		useContext(FirestoreContext);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
		reset,
	} = useForm<RegisterInputs>();

	const signup = (authorizedUid: string, email: string, password: string) => {
		const res = axios.post("/api/user/create", {
			authorizedUid,
			email,
			password,
		});
		return res;
	};

	const onSubmit: SubmitHandler<RegisterInputs> = ({
		email,
		password,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		confirmPassword,
		...rest
	}) => {
		if (!currentUser) return;

		setIsLoading(true);
		setFormError("");

		const userData = {
			email,
			...rest,
		};

		getUidFromIdNumber(userData.idNumber)
			.then(() => {
				return setFormError("ID number already exist.");
			})
			.catch(() => {
				signup(currentUser.uid, email, password)
					.then(async (res) => {
						const user = res.data as UserRecord;
						const uid = user.uid;

						// add to user table
						addUser(uid, userData).then(() => {
							alert("User created successfully!");
							reset();
						});
					})
					.catch((err) => {
						console.log(err);
						setFormError(err.response.data.message);
					});
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(() => {
		if (!currentUser) {
			router.push("/login");
		}
	}, [currentUser, router]);

	if (!currentUser) {
		return null;
	}

	if (!currentUserData) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
					Loading...
				</h1>
			</main>
		);
	}

	if (currentUserData.role !== Roles.ADMIN) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
					Admin Only
				</h1>
			</main>
		);
	}

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
					<div className="mt-8 p-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<select
										className="focus:ring-primary-500 focus:border-primary-500 block w-52 rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-700 shadow-sm focus:outline-none"
										{...register("role", {
											onChange: (e) => {
												setRole(e.target.value);
											},
										})}
										defaultValue={Roles.STUDENT}
									>
										{(Object.values(Roles) as Role[]).map(
											(item) => {
												return (
													<option
														key={item}
														value={item}
													>
														{item}
													</option>
												);
											}
										)}
									</select>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.role && errors.role.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="ID Number"
										{...register("idNumber", {
											required: "Field is required",
											// TODO: add regex pattern
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.idNumber &&
											errors.idNumber.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="RFID Card Number"
										{...register("cardNumber", {
											required: "Field is required",
											max: 10,
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.idNumber &&
											errors.idNumber.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="First Name"
										{...register("firstName", {
											required: "Field is required",
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.firstName &&
											errors.firstName.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Middle Name"
										{...register("middleName", {
											required: "Field is required",
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.middleName &&
											errors.middleName.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Last Name"
										{...register("lastName", {
											required: "Field is required",
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.lastName &&
											errors.lastName.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Mobile (09876543210)"
										{...register("mobileNumber", {
											required: "Field is required",
											//TODO: add regex pattern
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.mobileNumber &&
											errors.mobileNumber.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Home Address"
										{...register("address", {
											required: "Field is required",
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.address &&
											errors.address.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="email"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Email"
										{...register("email", {
											required: "Field is required",
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.email && errors.email.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="password"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Password"
										{...register("password", {
											required: "Field is required",
											minLength: 6,
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.password &&
											errors.password.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="password"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Confirm Password"
										{...register("confirmPassword", {
											required: "Field is required",
											validate: (val: string) => {
												if (watch("password") != val) {
													return "Your passwords do no match";
												}
											},
										})}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.confirmPassword &&
											errors.confirmPassword.message}
									</span>
								</div>
							</div>
							<RoleDataInputs
								role={role}
								register={register}
								errors={errors}
							/>
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

type RoleDataProps = {
	role: Role;
	register: UseFormRegister<RegisterInputs>;
	errors: Partial<FieldErrorsImpl<RegisterInputs>>;
};
const RoleDataInputs = ({ role, register, errors }: RoleDataProps) => {
	if (role === Roles.STUDENT) {
		return (
			<>
				<div className="mb-2 flex flex-col">
					<div className=" relative ">
						<input
							type="text"
							className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
							placeholder="Course"
							{...register("course", {
								required: "Field is required",
							})}
						/>
						<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
							{errors.course && errors.course.message}
						</span>
					</div>
				</div>
				<div className="mb-2 flex flex-col">
					<div className=" relative ">
						<input
							type="text"
							className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
							placeholder="Year"
							{...register("year", {
								required: "Field is required",
							})}
						/>
						<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
							{errors.year && errors.year.message}
						</span>
					</div>
				</div>
			</>
		);
	}

	// for additional registration fields on different roles
	// if (role === Roles.INSERT_ROLE_HERE) { INSERT_OTHER_FIELDS_HERE }

	return null;
};

export default RegisterPage;
