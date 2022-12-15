import axios from "axios";
import type { FieldValue } from "firebase/firestore";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import type { TransactionData } from "../../../context/FirestoreContext";
import {
	FirestoreContext,
	TransactionTypes,
} from "../../../context/FirestoreContext";

const TransactionsPage = () => {
	const router = useRouter();
	const { currentUser } = useContext(AuthContext);
	const { currentUserData } = useContext(FirestoreContext);
	const { idNumber } = router.query;

	const [transactions, setTransactions] = useState([]);
	const [error, setError] = useState(false);
	const [refresh, setRefresh] = useState(false);

	const timestampToDate = (timestamp: FieldValue) => {
		const { _seconds, _nanoseconds } = timestamp as unknown as {
			_seconds: number;
			_nanoseconds: number;
		};

		return new Date(_seconds * 1000 + _nanoseconds / 1000000);
	};

	const toggleRefresh = () => {
		setRefresh((prev) => !prev);
	};

	useEffect(() => {
		axios
			.get(`/api/user/${idNumber}/transactions`)
			.then((res) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const data: any = res.data;
				setTransactions(data);
			})
			.catch((err) => {
				console.log(err);
				setError(true);
			});
	}, [idNumber, refresh]);

	useEffect(() => {
		if (!currentUser) {
			router.push("/login");
		}
	}, [currentUser, router]);

	if (!currentUser) {
		return null;
	}

	if (error) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-[#0D2A21] md:text-[5rem]">
					No Transactions Found
				</h1>
			</main>
		);
	}

	if (!transactions) {
		return (
			<main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-[#0D2A21] md:text-[5rem]">
					Loading...
				</h1>
			</main>
		);
	}

	return (
		<main className="container mx-auto flex min-h-screen flex-col flex-wrap items-center justify-center p-4">
			<button onClick={toggleRefresh}>Refresh</button>
			<p className="text-[#0D2A21]"></p>
			<div className="container mx-auto flex flex-col items-center justify-center p-4">
				<h1 className="text-5xl font-extrabold leading-normal text-[#0D2A21]">
					Balance:{" "}
					{Number(currentUserData?.funds).toLocaleString("en-PH", {
						currency: "PHP",
						style: "currency",
					})}
				</h1>
			</div>
			<table className="table rounded-lg bg-[#0d2a21] p-4 shadow">
				<thead>
					<tr>
						<th className="dark:border-dark-5 whitespace-nowrap border-b-2 p-4 font-normal text-white">
							Type
						</th>
						<th className="dark:border-dark-5 whitespace-nowrap border-b-2 p-4 font-normal text-white">
							Sender
						</th>
						<th className="dark:border-dark-5 whitespace-nowrap border-b-2 p-4 font-normal text-white">
							Receiver
						</th>
						<th className="dark:border-dark-5 whitespace-nowrap border-b-2 p-4 font-normal text-white">
							Amount
						</th>
						<th className="dark:border-dark-5 whitespace-nowrap border-b-2 p-4 font-normal text-white">
							Date
						</th>
					</tr>
				</thead>
				<tbody>
					{transactions
						.filter((x) => !!x)
						.sort(
							(a: TransactionData, b: TransactionData) =>
								timestampToDate(
									b?.createdAt
								).getMilliseconds() -
								timestampToDate(a?.createdAt).getMilliseconds()
						)
						.map((transaction: TransactionData, idx) => {
							const type =
								transaction.message === "Receive" &&
								transaction.receiver === (idNumber as string)
									? TransactionTypes.RECEIVE
									: transaction.type;
							return (
								<tr key={idx} className="text-white">
									<td className="dark:border-dark-5 border-b-2 p-4">
										{type}
									</td>
									<td className="dark:border-dark-5 border-b-2 p-4">
										{transaction.sender}
									</td>
									<td className="dark:border-dark-5 border-b-2 p-4">
										{transaction.receiver}
									</td>
									<td className="dark:border-dark-5 border-b-2 p-4">
										{transaction.sender === idNumber
											? "- "
											: "+ "}
										{Number(
											transaction.amount
										).toLocaleString("en-PH", {
											currency: "PHP",
											style: "currency",
										})}
									</td>
									<td className="dark:border-dark-5 border-b-2 p-4">
										{timestampToDate(
											transaction.createdAt
										).toLocaleString()}
									</td>
								</tr>
							);
						})}
				</tbody>
			</table>
		</main>
	);
};

export default TransactionsPage;
