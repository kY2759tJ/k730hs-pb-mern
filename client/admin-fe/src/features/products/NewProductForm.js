import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddNewProductMutation } from "./productsApiSlice";
import { Form, Input, Button, Divider, message, InputNumber } from "antd";

const NewProductForm = ({ isInModal, onAddProduct }) => {
  const [addNewProduct, { isLoading, isSuccess, isError, error }] =
    useAddNewProductMutation();

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      if (!isInModal) {
        navigate("/dash/products"); // Only navigate if not in modal
      }
    }
  }, [isSuccess, navigate, form]);

  const onFinish = async (values) => {
    const { productName, basePrice } = values;

    try {
      const newProduct = await addNewProduct({
        productName,
        basePrice,
      }).unwrap();
      const newItem = {
        product: newProduct.id,
        quantity: 1,
        totalPrice: basePrice,
        productName: productName,
      };
      message.success("Product added successfully");
      console.log("Product added successfully ", newProduct);
      onAddProduct(newItem); // Pass the new product back to NewOrderForm
      form.resetFields(); // Clear form after submission
    } catch (err) {
      message.error("Failed to add product");
      console.error("Failed to add product:", err);
    }
  };

  const errClass = isError ? "errmsg" : "offscreen";
  const errContent = error?.data?.message ?? "";

  const content = (
    <>
      <p className={errClass}>{errContent}</p>

      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
      >
        {!isInModal && (
          <div className="form__title-row">
            <h2>Add New Product</h2>
          </div>
        )}

        <Divider />

        <Form.Item
          name="productName"
          label="Product Name"
          rules={[{ required: true, message: "Please input product name!" }]}
        >
          <Input placeholder="Product Name" />
        </Form.Item>

        <Form.Item
          name="basePrice"
          label="Base Price"
          rules={[
            { required: true, message: "Base price is required!" },
            {
              type: "number",
              min: 0,
              message: "Base price must be a positive number!",
            },
          ]}
        >
          <InputNumber placeholder="Base Price" />
        </Form.Item>

        <div className="form__action-buttons">
          <Button
            type="primary"
            title="Save"
            htmlType="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            Add New Product
          </Button>
        </div>
      </Form>
    </>
  );

  return content;
};

export default NewProductForm;
