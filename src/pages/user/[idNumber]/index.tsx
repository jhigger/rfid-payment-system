import axios from "axios";
import type { FieldValue } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { AuthContext } from "../../../context/AuthContext";

const UserDataPage = () => {
	const router = useRouter();
	const { currentUser } = useContext(AuthContext);
	const { idNumber } = router.query;

	const [userData, setUserData] = useState(null);
	const [error, setError] = useState(false);

	const timestampToLocaleString = (timestamp: FieldValue) => {
		const { _seconds, _nanoseconds } = timestamp as unknown as {
			_seconds: number;
			_nanoseconds: number;
		};

		return new Date(
			_seconds * 1000 + _nanoseconds / 1000000
		).toLocaleString();
	};

	const handleDeleteUser = () => {
		const yes = confirm(
			`Are you sure you want to delete this user? ${idNumber}`
		);
		if (yes) {
			if (!currentUser) return;
			axios
				.delete("/api/user/delete", {
					data: {
						authorizedUid: currentUser.uid,
						idNumber,
					},
				})
				.then((res) => {
					alert(res.data.message);
					router.back();
				})
				.catch((err) => console.log(err));
		}
	};

	useEffect(() => {
		axios
			.get(`/api/user/${idNumber}`)
			.then((res) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const data: any = res.data;
				setUserData(data);
			})
			.catch((err) => {
				console.log(err);
				setError(true);
			});
	}, [idNumber]);

	useEffect(() => {
		if (!currentUser) {
			router.push("/login");
		}
	}, [currentUser, router]);

	if (!currentUser) {
		return null;
	}

	if (error) {
		return <>User Not Found</>;
	}

	if (!userData) {
		return <>Loading...</>;
	}

	return (
		<div className="container mx-auto my-[15vh] flex w-full max-w-max flex-col gap-2">
			<ul>
				{Object.keys(userData).map((key, idx) => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					let value: any = userData[key];
					if (
						key === "createdAt" ||
						key === "updatedAt" ||
						key === "roleDataCreatedAt" ||
						key === "roleDataUpdatedAt"
					) {
						value = timestampToLocaleString(userData[key]);
					}
					return (
						<li key={idx} className="flex gap-4">
							<span className="font-bold">{key}:</span>
							<span className="">
								{value !== null && value !== undefined
									? value.toString()
									: "None"}
							</span>
						</li>
					);
				})}
			</ul>
			<div className="flex w-full max-w-xl gap-4">
				<DeleteButton handleDeleteUser={handleDeleteUser} />
				<EditButton idNumber={idNumber as string} />
				<TransactionsButton idNumber={idNumber as string} />
			</div>
		</div>
	);
};

const EditButton = ({ idNumber }: { idNumber: string }) => {
	return (
		<Link href={`/user/${idNumber}/update`}>
			<button
				type="button"
				className="flex w-max items-center justify-center rounded-lg  bg-[#02A66D] py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-[#006400] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2  focus:ring-offset-blue-200 "
			>
				<FaEdit className="mr-2" />
				Edit
			</button>
		</Link>
	);
};

const TransactionsButton = ({ idNumber }: { idNumber: string }) => {
	return (
		<Link href={`/user/${idNumber}/transactions`}>
			<button
				type="button"
				className="flex w-max items-center justify-center rounded-lg  bg-[#02A66D] py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-[#006400] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2  focus:ring-offset-blue-200 "
			>
				<GrTransaction className="mr-2 invert" />
				Transactions
			</button>
		</Link>
	);
};
const DeleteButton = ({
	handleDeleteUser,
}: {
	handleDeleteUser: () => void;
}) => {
	return (
		<button
			onClick={handleDeleteUser}
			type="button"
			className="flex w-max items-center justify-center rounded-lg  bg-red-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-[#006400] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2  focus:ring-offset-blue-200 "
		>
			<FaTrash className="mr-2" />
			Delete
		</button>
	);
};

export default UserDataPage;
