import type { NextApiRequest, NextApiResponse } from "next";
import userTransactions from "./index";

const userTransactionsLimit = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	await userTransactions(req, res);
};

export default userTransactionsLimit;
