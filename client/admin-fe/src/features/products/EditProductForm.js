import { useEffect } from "react";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "./productsApiSlice";
import { useNavigate } from "react-router-dom";
import { Row, Col, Divider, Form, Input, Button, Select } from "antd";

const EditProductForm = ({ product, users }) => {
  const [updateProduct, { isLoading, isSuccess, isError, error }] =
    useUpdateProductMutation();

  const [
    deleteProduct,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteProductMutation();

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      form.resetFields();
      navigate("/dash/products");
    }
  }, [isSuccess, isDelSuccess, navigate, form]);

  const onFinish = async (values) => {
    const { productName, basePrice } = values;
    console.log("Payload to send:", {
      id: product.id,
      productName,
      basePrice,
    }); // Add this line for debugging

    try {
      await updateProduct({
        id: product.id,
        productName,
        basePrice,
      });
      console.log("Updated product successfully");
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

  const onDeleteProduct = async () => {
    await deleteProduct({ id: product.id });
  };

  const created = new Date(product.createdAt).toLocaleString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
  const updated = new Date(product.updatedAt).toLocaleString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

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
        initialValues={{
          user: product.user,
          productName: product.productName,
          basePrice: product.basePrice,
        }}
      >
        <div className="form__title-row">
          <h2>Edit Product - {product.productName}</h2>
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
        <div className="form__divider"></div>
        <Row>
          <Col span={12}>
            <p className="form__updated">
              Date Updated:
              <br />
              {updated}
            </p>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              title="Save"
              htmlType="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Update Product
            </Button>
          </Col>
        </Row>
        <div className="form__action-buttons"></div>
      </Form>
    </>
  );

  return content;
};

export default EditProductForm;
