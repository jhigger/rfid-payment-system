import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import type { FieldErrorsImpl, UseFormRegister } from "react-hook-form";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext";
import type {
	Role,
	UpdateData,
	UserData,
} from "../../../context/FirestoreContext";
import { FirestoreContext, Roles } from "../../../context/FirestoreContext";

type UpdateInputs = UpdateData;

const UpdateUserPage = () => {
	const router = useRouter();
	const { idNumber } = router.query;
	const [isLoading, setIsLoading] = useState(false);
	const [formError, setFormError] = useState("");
	const [role, setRole] = useState<Role>("student");
	const { currentUser } = useContext(AuthContext);
	const { currentUserData, getUidFromIdNumber, getUser, getRoleData } =
		useContext(FirestoreContext);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<UpdateInputs>();

	useEffect(() => {
		getUser(idNumber as string)
			.then((user) => {
				if (!user) return;

				setRole(user.role);
				setValue("role", user.role);
				setValue("idNumber", user.idNumber);
				setValue("firstName", user.firstName);
				setValue("middleName", user.middleName);
				setValue("lastName", user.lastName);
				setValue("mobileNumber", user.mobileNumber);
				setValue("address", user.address);
				setValue("email", user.email);
				setValue("disabled", user.disabled);
				setValue("pin", user.pin);
				getRoleData(user.role, user.idNumber).then((role) => {
					if (!role) return;

					setValue("course", role.course);
					setValue("year", role.year);
				});
			})
			.catch((err) => console.log(err));
	}, [idNumber, getUser, getRoleData, setValue]);

	const updateUserData = (
		authorizedUid: string,
		idNumber: string,
		userData: Partial<UserData>
	) => {
		const res = axios.put("/api/user/update", {
			authorizedUid,
			idNumber,
			userData,
		});
		return res;
	};

	const onSubmit: SubmitHandler<UpdateInputs> = ({ ...rest }) => {
		if (!currentUser) return;

		setIsLoading(true);
		setFormError("");

		const userData = {
			...rest,
		};
		console.log(userData);

		getUidFromIdNumber(userData.idNumber)
			.then(() => {
				updateUserData(currentUser.uid, userData.idNumber, userData)
					.then(() => {
						reset();
						router.push(`/user/${idNumber}`);
					})
					.catch((err) => {
						console.log(err);
						setFormError(err.response.data.message);
					});
			})
			.catch((err) => {
				console.log(err);
				setFormError(err.response.data.message);
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
				<h1 className="text-5xl font-extrabold leading-normal text-[#006400] md:text-[5rem]">
					Loading...
				</h1>
			</main>
		);
	}

	if (currentUserData.role !== Roles.ADMIN) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-[#006400] md:text-[5rem]">
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
				<div className="flex max-w-md flex-col rounded-lg bg-[#0D2A21] px-4 py-8 shadow sm:px-6 md:px-8 lg:px-10">
					<div className="mb-2 self-center text-xl font-light text-gray-800 dark:text-white sm:text-2xl">
						Edit account
					</div>
					<div className="mt-8 p-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<select
										className="focus:ring-primary-500 focus:border-primary-500 block w-52 rounded-md border border-gray-300 bg-white py-2 px-3 text-[#006400] shadow-sm focus:outline-none"
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
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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
									<span className="text-white">
										Disabled:{" "}
									</span>
									<input
										type={"checkbox"}
										// className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Disabled"
										{...register("disabled")}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.disabled &&
											errors.disabled.message}
									</span>
								</div>
							</div>
							<div className="mb-2 flex flex-col">
								<div className=" relative ">
									<input
										type="text"
										className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
										placeholder="Pin (optional)"
										{...register("pin")}
									/>
									<span className="flex-items-center justify-center text-center text-sm text-red-500 dark:text-red-400">
										{errors.pin && errors.pin.message}
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
									className="w-full rounded-lg  bg-[#02A66D] py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2  focus:ring-offset-purple-200 "
									disabled={isLoading}
								>
									{isLoading ? (
										<FaSpinner className="mr-2 inline animate-spin" />
									) : (
										"Update"
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
	register: UseFormRegister<UpdateInputs>;
	errors: Partial<FieldErrorsImpl<UpdateInputs>>;
};
const RoleDataInputs = ({ role, register, errors }: RoleDataProps) => {
	if (role === Roles.STUDENT) {
		return (
			<>
				<div className="mb-2 flex flex-col">
					<div className=" relative ">
						<input
							type="text"
							className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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
							className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-[#006400] placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
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

export default UpdateUserPage;
