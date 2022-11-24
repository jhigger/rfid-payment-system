import type { NextApiRequest, NextApiResponse } from "next";
import { getUser } from "../../../../utils/helperFunctions";

const user = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "GET") {
			// Process a GET request
			const { idNumber } = req.query;
			const userDocSnap = await getUser(idNumber);
			// check if id number exists
			if (!userDocSnap.docs[0]?.exists) {
				return res
					.status(404)
					.json({ message: "User data does not exists." });
			}

			res.status(200).json({ ...userDocSnap.docs[0].data() });
		} else {
			// Handle any other HTTP method
			res.status(200).json({ name: "Hello, world!" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

export default user;
