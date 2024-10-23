import { message } from "antd";

export const addProductToList = (newItem, setProducts, setItems) => {
  setProducts((prev) => [...prev, newItem]);
  setItems((prevItems) => [...prevItems, newItem]);
  message.success("Product added and selected");
  console.log("Product added and selected ", newItem);
};
