import { useSelector } from "react-redux";
import { selectAllUsers } from "../users/usersApiSlice";
import NewCampaignForm from "./NewCampaignForm";

const NewCampaign = () => {
  const users = useSelector(selectAllUsers);

  if (!users?.length) return <p>Not Currently Available</p>;

  const content = <NewCampaignForm users={users} />;

  return content;
};
export default NewCampaign;
