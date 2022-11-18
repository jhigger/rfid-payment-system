import type { NextApiRequest, NextApiResponse } from "next";
import admin from "../../../lib/firebase-admin";

const raids = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "POST") {
			// Process a POST request
			const user = await admin.auth().createUser({
				email: "data.email",
				password: "data.password",
				displayName: "data.displayName",
				emailVerified: false,
				disabled: false,
			});

			res.status(200).json({ user });
		} else {
			// Handle any other HTTP method
			res.status(200).json({ name: "Hello, world!" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

export default raids;
