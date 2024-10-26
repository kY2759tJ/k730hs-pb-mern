import NewOrderForm from "./NewOrderForm";
import { useGetUsersQuery } from "../users/usersApiSlice";
import { useGetCampaignsQuery } from "../campaigns/campaignsApiSlice";
import { useGetProductsQuery } from "../products/productsApiSlice";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";
import useAuth from "../../hooks/useAuth";

const NewOrder = () => {
  useTitle("SMPost: New Order");

  const { userId } = useAuth();

  const { user } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      user: data?.entities[userId],
    }),
  });

  const { campaigns } = useGetCampaignsQuery("campaignsList", {
    selectFromResult: ({ data }) => ({
      campaigns: data
        ? data.ids
            .map((id) => data.entities[id])
            .filter(
              (campaign) =>
                campaign.user === user?.id && campaign.status === "Active"
            )
        : [],
    }),
  });

  console.log(campaigns);

  const { products } = useGetProductsQuery("productsList", {
    selectFromResult: ({ data }) => ({
      products: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  if (!campaigns?.length || !products?.length)
    return <PulseLoader color={"#FFF"} />;

  //if (!users?.length) return <PulseLoader color={"#FFF"} />;

  const content = (
    <NewOrderForm
      user={user}
      campaigns={campaigns}
      products={products}
    />
  );

  return content;
};
export default NewOrder;
