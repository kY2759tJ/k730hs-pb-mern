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

  if (!product) return <PulseLoader color={"#FFF"} />;

  if (!isAdmin) {
    if (product.username !== username) {
      return <p className="errmsg">No access</p>;
    }
  }

  const content = <EditProductForm product={product} />;

  return content;
};
export default EditProduct;
