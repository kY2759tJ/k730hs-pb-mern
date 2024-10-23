import { message } from "antd";

export const addProductToList = (newItem, setProducts, setItems) => {
  setProducts((prev) => [...prev, newItem]);
  setItems((prevItems) => [...prevItems, newItem]);
  message.success("Product added and selected");
  console.log("Product added and selected ", newItem);
};

/**
 * Updates product list and items based on edited product details.
 *
 * @param {Object} updatedProduct - The updated product details.
 * @param {Array} products - The existing list of products.
 * @param {Array} items - The existing list of items in the order.
 * @param {Function} setProducts - State setter for products.
 * @param {Function} setItems - State setter for items.
 * @param {Function} calculateTotalAmount - Function to calculate total amount.
 * @param {Function} calculateCommission - Function to calculate commission.
 * @param {Number} commissionRate - The commission rate to apply.
 * @param {Object} form - Ant Design form instance to update fields.
 */
export const onEditProduct = (
  updatedProduct,
  products,
  items,
  setProducts,
  setItems,
  calculateTotalAmount,
  calculateCommission,
  commissionRate,
  form
) => {
  // Update the product list with the edited product
  const updatedProducts = products.map((product) =>
    product.id === updatedProduct.id ? updatedProduct : product
  );
  setProducts(updatedProducts);

  // Update the items in the order that use this product
  const updatedItems = items.map((item) =>
    item.product === updatedProduct.id
      ? {
          ...item,
          productName: updatedProduct.productName,
          basePrice: updatedProduct.basePrice,
          totalPrice: item.quantity * updatedProduct.basePrice,
        }
      : item
  );
  setItems(updatedItems);

  // Recalculate totals and update the form fields
  const newTotalAmount = calculateTotalAmount(updatedItems);
  const newCommissionAmount = calculateCommission(
    newTotalAmount,
    commissionRate
  );

  form.setFieldsValue({
    totalAmount: newTotalAmount,
    commissionAmount: newCommissionAmount,
  });
};
