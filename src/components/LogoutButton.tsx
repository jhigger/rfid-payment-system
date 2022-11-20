import { FaSignOutAlt } from "react-icons/fa";

const LogoutButton = ({ handleLogout }: { handleLogout: () => void }) => {
	return (
		<button
			type="button"
			className="flex w-max items-center justify-center rounded-lg  bg-red-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2  focus:ring-offset-red-200 "
			onClick={handleLogout}
		>
			<FaSignOutAlt className="mr-2" />
			Logout
		</button>
	);
};

export default LogoutButton;
