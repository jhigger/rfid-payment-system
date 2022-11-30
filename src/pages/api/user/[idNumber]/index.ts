import type { NextApiRequest, NextApiResponse } from "next";
import type { UserData } from "../../../../context/FirestoreContext";
import { getFromRole, getUser } from "../../../../utils/helperFunctions";

const user = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "GET") {
			// Process a GET request
			const { idNumber } = req.query;
			const userDocSnap = await getUser(idNumber as string);
			// check if id number exists
			if (!userDocSnap.docs[0]?.exists) {
				return res
					.status(404)
					.json({ message: "User data does not exists." });
			}

			const { role } = userDocSnap.docs[0].data() as UserData;
			const roleDocSnap = await getFromRole(userDocSnap.docs[0].id, role);
			if (!roleDocSnap.exists) {
				return res
					.status(404)
					.json({ message: "Role data does not exists." });
			}
			const roleData = { ...roleDocSnap.data() };

			res.status(200).json({
				...userDocSnap.docs[0].data(),
				roleDataCreatedAt: roleData.createdAt,
				roleDataUpdatedAt: roleData.updatedAt,
				...roleData,
			});
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
