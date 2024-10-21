import { useState, useEffect } from "react";
import {
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from "./ordersApiSlice";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Divider,
  Form,
  Input,
  Button,
  Select,
  Table,
  InputNumber,
} from "antd";

//Get Order Enums
import { OrderStatuses, CustomerPlatforms } from "../../config/enums";
import FormItem from "antd/es/form/FormItem";

// URL validation rule
const urlValidationRule = {
  type: "url",
  message: "Please enter a valid URL!",
};

const EditOrderForm = ({ order, users }) => {
  const [updateOrder, { isLoading, isSuccess, isError, error }] =
    useUpdateOrderMutation();

  const [
    deleteOrder,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteOrderMutation();

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();
  const [items, setItems] = useState(order.itemsWithProductNames);
  const [showAddItem, setShowAddItem] = useState(false); // State for showing the add item section
  const [selectedProduct, setSelectedProduct] = useState(null); // State for selected product

  // Calculate total amount from items
  const calculateTotalAmount = () => {
    const total = items.reduce((total, item) => total + item.totalPrice, 0);
    return parseFloat(total.toFixed(2)); // Changed to 1 decimal point
  };

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      form.resetFields();
      navigate("/dash/orders");
    }
  }, [isSuccess, isDelSuccess, navigate, form]);

  // Handle item quantity change
  // Handle item quantity change
  const handleQuantityChange = (index, quantity) => {
    const newItems = items.map((item, idx) => {
      if (idx === index) {
        // Create a new object with updated quantity and totalPrice
        return {
          ...item,
          quantity: quantity,
          totalPrice: quantity * (item.productName ? item.productBasePrice : 0), // Example pricing logic
        };
      }
      return item; // Return unchanged item
    });

    setItems(newItems);
    // Update the form's totalAmount field
    form.setFieldsValue({ totalAmount: calculateTotalAmount() });
  };

  // Toggle the visibility of the add item section
  const toggleAddItem = () => {
    setShowAddItem((prev) => !prev);
  };

  // Handle adding a new item
  const addItem = () => {
    if (!selectedProduct) return; // Ensure a product is selected

    const newItem = {
      product: selectedProduct.id, // Store product ID
      quantity: 1,
      total_price: selectedProduct.price, // Set total price based on selected product
      productName: selectedProduct.name,
    };

    setItems([...items, newItem]);
    setSelectedProduct(null); // Reset the selected product after adding
  };

  const onFinish = async (values) => {
    const { user, status, title, social_media, post_type, post_url } = values;
    console.log("Payload to send:", {
      id: order.id,
      user,
      status,
      title,
      social_media,
      post_type,
      post_url,
    }); // Add this line for debugging

    try {
      await updateOrder({
        id: order.id,
        user,
        status,
        title,
        social_media,
        post_type,
        post_url,
      });
      console.log("Updated order successfully");
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const onDeleteOrder = async () => {
    await deleteOrder({ id: order.id });
  };

  const created = new Date(order.createdAt).toLocaleString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
  const updated = new Date(order.updatedAt).toLocaleString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const orderStatusesOptions = Object.values(OrderStatuses).map(
    (order_status_option) => ({
      value: order_status_option,
      label: order_status_option,
    })
  );

  const CustomerPlatformsOptions = Object.values(CustomerPlatforms).map(
    (order_status_option) => ({
      value: order_status_option,
      label: order_status_option,
    })
  );

  // Sample product data
  const products = [
    { id: "6715e7bc51ec8fb709580a7d", name: "Pokeball V1.2", price: 21 },
    { id: "6715ea1b3a51185197b334ce", name: "Pokeball V2.2", price: 42 },
    // Add more products as needed
  ];

  // Columns for the items table
  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record, index) => (
        <InputNumber
          style={{ maxWidth: "300px" }}
          value={text}
          min={1}
          onChange={(value) => handleQuantityChange(index, value)}
        />
      ),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text) => (
        <p>
          {new Intl.NumberFormat("en-MY", {
            style: "currency",
            currency: "MYR",
          }).format(text)}
        </p>
      ),
    },
  ];

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
        style={{ maxWidth: 800 }}
        onFinish={onFinish}
        initialValues={{
          user: order.user,
          status: order.status,
          orderId: order.orderId,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          customerContact: order.customer.contact,
          customerPlatform: order.customer.platform,
          totalAmount: order.totalAmount,
        }}
      >
        <div className="form__title-row">
          <h2>Edit Order #{order.orderId}</h2>
        </div>
        <Divider
          orientation="left"
          style={{ color: "#ffffff", borderColor: "#ffffff" }}
        >
          Order Information
        </Divider>
        <Row>
          <Col span={8}>
            <p className="form__created">
              Date Created:
              <br />
              {created}
            </p>
          </Col>

          <Col span={8}>
            <p className="form__created">
              Campaign: <br></br> {order.campaign}
            </p>
          </Col>
          <Col span={8}>
            <p className="form__created">
              Salesperson: <br></br>
              {order.fullname}
            </p>
          </Col>
        </Row>
        <br></br>
        <Row>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[
                { required: true, message: "Please select a order status!" },
              ]}
            >
              <Select
                placeholder="Select order status"
                style={{ width: "100%" }}
                options={orderStatusesOptions}
              ></Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="user"
              hidden
            >
              <Input
                type="hidden"
                readOnly
                disabled
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider
          orientation="left"
          style={{ color: "#ffffff", borderColor: "#ffffff" }}
        >
          Customer Information
        </Divider>

        <Form.Item
          name="customerName"
          label="Customer Name"
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="customerEmail"
          rules={[{ required: true, type: "email" }]}
        >
          <Input placeholder="Enter customer email" />
        </Form.Item>

        <Form.Item
          label="Contact"
          name="customerContact"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter customer contact" />
        </Form.Item>

        <Form.Item
          name="customerPlatform"
          label="Platform"
          rules={[
            { required: true, message: "Please select a customer platform!" },
          ]}
        >
          <Select
            placeholder="Select customer platform"
            style={{ width: "100%" }}
            options={CustomerPlatformsOptions}
          ></Select>
        </Form.Item>

        <Divider
          orientation="left"
          style={{ color: "#ffffff", borderColor: "#ffffff" }}
        >
          Order Item Information
        </Divider>
        <Table
          dataSource={items}
          columns={columns}
          pagination={false}
          rowKey="product"
        />
        <Row>
          <Col
            span={6}
            style={{ marginTop: "1em" }}
          >
            <Button
              type="primary"
              onClick={toggleAddItem}
            >
              {showAddItem ? "Hide Add Product" : "Add Product"}
            </Button>
          </Col>

          <Col
            span={12}
            offset={6}
            style={{ textAlign: "right", marginTop: "1em" }}
          >
            <FormItem
              name="totalAmount"
              label="Total Amount (RM)"
            >
              <InputNumber
                name="totalAmount"
                value={calculateTotalAmount()}
                readOnly // Make it read-only
              />
            </FormItem>
          </Col>
        </Row>
        {showAddItem && (
          <div>
            <h3>Add New Item</h3>
            <Row>
              <Col flex="auto">
                <Form.Item
                  label="Select Product"
                  maxWidth="100%"
                >
                  <Select
                    maxWidth="100%"
                    onChange={(productId) =>
                      setSelectedProduct(
                        products.find((p) => p.id === productId)
                      )
                    }
                    placeholder="Select a product"
                  >
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col flex="40px">
                <Button
                  type="primary"
                  onClick={addItem}
                  disabled={!selectedProduct}
                >
                  Add Item
                </Button>
              </Col>
            </Row>
          </div>
        )}

        <Divider
          orientation="left"
          style={{ color: "#ffffff", borderColor: "#ffffff" }}
        ></Divider>
        <Row>
          <Col span={12}>
            <Col span={12}>
              <p className="form__updated">
                Last Updated:
                <br />
                {updated}
              </p>
            </Col>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              title="Save"
              htmlType="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Update Order
            </Button>
          </Col>
        </Row>
        <div className="form__action-buttons"></div>
      </Form>
    </>
  );

  return content;
};

export default EditOrderForm;
