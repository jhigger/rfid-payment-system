import axios from "axios";
import type { FieldValue } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { UserData } from "../../context/FirestoreContext";

const UserDataPage = () => {
	const router = useRouter();
	const { idNumber } = router.query;

	const [userData, setUserData] = useState<UserData | null>(null);
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
				const data = res.data as UserData;
				setUserData(data);
			})
			.catch((err) => {
				console.log(err);
				setError(true);
			});
	}, [idNumber]);

	if (!userData) {
		return <>Loading...</>;
	}

	if (error) {
		return <>User Not Found</>;
	}

	return (
		<>
			{Object.keys(userData).map((key, idx) => {
				let value = userData[key as keyof typeof userData];

				if (key === "createdAt" || key === "updatedAt") {
					value = timestampToLocaleString(userData[key]);
				}

				return (
					<div key={idx}>
						{key}: {value ? value.toString() : "None"}
					</div>
				);
			})}
		</>
	);
};

export default UserDataPage;
