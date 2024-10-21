import { useParams } from "react-router-dom";
import EditOrderForm from "./EditOrderForm";
import { useGetOrdersQuery } from "./ordersApiSlice";
import { useGetUsersQuery } from "../users/usersApiSlice";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

const EditOrder = () => {
  useTitle("SMPost: Edit Order");

  const { id } = useParams();

  const { username, isAdmin } = useAuth();

  const { order } = useGetOrdersQuery("ordersList", {
    selectFromResult: ({ data }) => ({
      order: data?.entities[id],
    }),
  });

  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  if (!order || !users?.length) return <PulseLoader color={"#FFF"} />;

  if (!isAdmin) {
    if (order.username !== username) {
      return <p className="errmsg">No access</p>;
    }
  }

  const content = (
    <EditOrderForm
      order={order}
      users={users}
    />
  );

  return content;
};
export default EditOrder;
