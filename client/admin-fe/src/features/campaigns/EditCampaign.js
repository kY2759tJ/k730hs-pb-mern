import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCampaignById } from "./campaignsApiSlice";
import { selectAllUsers } from "../users/usersApiSlice";
import EditCampaignForm from "./EditCampaignForm";

const EditCampaign = () => {
  const { id } = useParams();

  const campaign = useSelector((state) => selectCampaignById(state, id));
  const users = useSelector(selectAllUsers);

  const content =
    campaign && users ? (
      <EditCampaignForm
        campaign={campaign}
        users={users}
      />
    ) : (
      <p>Loading...</p>
    );

  return content;
};
export default EditCampaign;
