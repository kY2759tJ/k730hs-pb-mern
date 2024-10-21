import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);
  let isAdmin = false;
  let status = "Salesperson";
  let userId = null;

  if (token) {
    const decoded = jwtDecode(token);

    // Extracting the userId from decoded token
    userId = decoded.UserInfo.id; // MongoDB ObjectId
    const { username, roles } = decoded.UserInfo;

    isAdmin = roles.includes("Admin");

    if (isAdmin) status = "Admin";

    return { userId, username, roles, status, isAdmin };
  }

  return { userId, username: "", roles: [], isAdmin, status };
};
export default useAuth;
