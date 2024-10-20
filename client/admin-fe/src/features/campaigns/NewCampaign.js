import NewCampaignForm from "./NewCampaignForm";
import { useGetUsersQuery } from "../users/usersApiSlice";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

const NewCampaign = () => {
  useTitle("techCampaigns: New Campaign");

  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  if (!users?.length) return <PulseLoader color={"#FFF"} />;

  const content = <NewCampaignForm users={users} />;

  return content;
};
export default NewCampaign;
