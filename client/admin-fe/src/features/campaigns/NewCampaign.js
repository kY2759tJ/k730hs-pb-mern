import { useSelector } from "react-redux";
import { selectAllUsers } from "../users/usersApiSlice";
import NewCampaignForm from "./NewCampaignForm";

const NewCampaign = () => {
  const users = useSelector(selectAllUsers);

  const content = users ? <NewCampaignForm users={users} /> : <p>Loading...</p>;

  return content;
};
export default NewCampaign;
