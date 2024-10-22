import { useParams } from "react-router-dom";
import EditOrderForm from "./EditOrderForm";
import { useGetOrdersQuery } from "./ordersApiSlice";
import { useGetProductsQuery } from "../products/productsApiSlice";
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

  const { products } = useGetProductsQuery("productsList", {
    selectFromResult: ({ data }) => ({
      products: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  if (!order || !products?.length) return <PulseLoader color={"#FFF"} />;

  if (!isAdmin) {
    if (order.username !== username) {
      return <p className="errmsg">No access</p>;
    }
  }

  const content = (
    <EditOrderForm
      order={order}
      products={products}
    />
  );

  return content;
};
export default EditOrder;
