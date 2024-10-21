import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddNewProductMutation } from "./productsApiSlice";
import { Form, Input, Button, Select, Divider } from "antd";
import useAuth from "../../hooks/useAuth";

const NewProductForm = ({ users }) => {
  const [addNewProduct, { isLoading, isSuccess, isError, error }] =
    useAddNewProductMutation();

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      navigate("/dash/products");
    }
  }, [isSuccess, navigate, form]);

  const onFinish = async (values) => {
    const { productName, basePrice } = values;

    try {
      await addNewProduct({
        productName,
        basePrice,
      });
      console.log("Product added successfully");
    } catch (err) {
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
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
      >
        <div className="form__title-row">
          <h2>Add New Product</h2>
        </div>

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
          rules={[{ required: true, message: "Base price is required!" }]}
        >
          <Input placeholder="Base Price" />
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
