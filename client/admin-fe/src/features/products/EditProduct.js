import { useParams } from "react-router-dom";
import EditProductForm from "./EditProductForm";
import { useGetProductsQuery } from "./productsApiSlice";
import { useGetUsersQuery } from "../users/usersApiSlice";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

const EditProduct = () => {
  useTitle("SMPost: Edit Product");

  const { id } = useParams();

  const { username, isAdmin } = useAuth();

  const { product } = useGetProductsQuery("productsList", {
    selectFromResult: ({ data }) => ({
      product: data?.entities[id],
    }),
  });

  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  if (!product || !users?.length) return <PulseLoader color={"#FFF"} />;

  if (!isAdmin) {
    if (product.username !== username) {
      return <p className="errmsg">No access</p>;
    }
  }

  const content = (
    <EditProductForm
      product={product}
      users={users}
    />
  );

  return content;
};
export default EditProduct;
