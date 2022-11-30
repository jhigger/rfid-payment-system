import axios from "axios";
import type { FieldValue } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

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
					<div key={idx} className="flex gap-4">
						<span className="font-bold">{key}:</span>
						<span className="">
							{value !== null && value !== undefined
								? value.toString()
								: "None"}
						</span>
					</div>
				);
			})}
		</div>
	);
};

export default UserDataPage;
