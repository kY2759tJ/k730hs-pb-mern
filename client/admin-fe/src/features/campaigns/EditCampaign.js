import { useParams } from "react-router-dom";
import EditCampaignForm from "./EditCampaignForm";
import { useGetCampaignsQuery } from "./campaignsApiSlice";
import { useGetUsersQuery } from "../users/usersApiSlice";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

const EditCampaign = () => {
  useTitle("techCampaigns: Edit Campaign");

  const { id } = useParams();

  const { username, isManager, isAdmin } = useAuth();

  const { campaign } = useGetCampaignsQuery("campaignsList", {
    selectFromResult: ({ data }) => ({
      campaign: data?.entities[id],
    }),
  });

  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  if (!campaign || !users?.length) return <PulseLoader color={"#FFF"} />;

  if (!isManager && !isAdmin) {
    if (campaign.username !== username) {
      return <p className="errmsg">No access</p>;
    }
  }

  const content = (
    <EditCampaignForm
      campaign={campaign}
      users={users}
    />
  );

  return content;
};
export default EditCampaign;
