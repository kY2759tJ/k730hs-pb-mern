import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);
  let isManager = false;
  let isAdmin = false;
  let status = "Salesperson";
  let userId = null;

  if (token) {
    const decoded = jwtDecode(token);

    // Extracting the userId from decoded token
    userId = decoded.UserInfo.id; // MongoDB ObjectId
    const { username, roles } = decoded.UserInfo;

    isManager = roles.includes("Manager");
    isAdmin = roles.includes("Admin");

    if (isManager) status = "Manager";
    if (isAdmin) status = "Admin";

    return { userId, username, roles, status, isManager, isAdmin };
  }

  return { userId, username: "", roles: [], isManager, isAdmin, status };
};
export default useAuth;
