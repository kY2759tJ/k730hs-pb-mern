import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddNewOrderMutation } from "./ordersApiSlice";
import { useSelector } from "react-redux";
import { selectUserById } from "../users/usersApiSlice";
import useAuth from "../../hooks/useAuth";
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
  Card,
} from "antd";
import { CustomerPlatforms, OrderStatuses } from "../../config/enums";

// URL validation rule
const urlValidationRule = {
  type: "url",
  message: "Please enter a valid URL!",
};

const NewOrderForm = ({ campaigns, products }) => {
  const { userId } = useAuth();

  const [addNewOrder, { isLoading, isSuccess, isError, error }] =
    useAddNewOrderMutation();

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();

  const user = useSelector((state) => selectUserById(state, userId));

  console.log(user);

  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);

  const commissionRate = 0;

  //Update the form field once userId is set
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      navigate("/dash/orders");
    }
  }, [isSuccess, navigate, form]);

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

  const CampaignOptions = campaigns.map((campaign) => ({
    label: campaign.title, // Displayed text in the Select dropdown
    value: campaign.id, // Unique identifier for the option
  }));

  const ProductOptions = products.map((product) => ({
    label: product.productName, // Displayed text in the Select dropdown
    value: product.id, // Unique identifier for the option
    basePrice: product.basePrice, // Additional data (if needed)
  }));

  // Calculate total amount from items
  const calculateTotalAmount = (itemsList = items) => {
    const total = itemsList.reduce((acc, item) => acc + item.totalPrice, 0);
    return parseFloat(total.toFixed(2));
  };

  // Calculate commission earned
  const calculateCommission = (totalAmount, rate) => {
    return parseFloat(((totalAmount * rate) / 100).toFixed(2));
  };

  // Update form field when items change
  useEffect(() => {
    const totalAmount = calculateTotalAmount();
    form.setFieldsValue({ totalAmount: totalAmount });
    const commissionAmount = calculateCommission(totalAmount, commissionRate);
    form.setFieldsValue({ commissionAmount: commissionAmount }); // Update commission field

    setItems(items);
  }, [items, form, commissionRate]);

  // Handle item quantity change
  const handleQuantityChange = (index, quantity) => {
    const updatedItems = items.map((item, idx) =>
      idx === index
        ? {
            ...item,
            quantity: quantity,
            totalPrice: (item.totalPrice / item.quantity) * quantity,
          }
        : item
    );
    setItems(updatedItems);
  };

  // Toggle the visibility of the add item section
  const toggleAddItem = () => {
    setShowAddItem((prev) => !prev);
  };

  // Handle adding a new item
  const addItem = () => {
    if (!selectedProduct) return;

    const existingIndex = items.findIndex(
      (item) => item.product === selectedProduct.id
    );

    if (existingIndex !== -1) {
      const updatedItems = [...items];
      const existingItem = updatedItems[existingIndex];
      updatedItems[existingIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
        totalPrice: (existingItem.quantity + 1) * selectedProduct.basePrice,
      };
      setItems(updatedItems);
    } else {
      const newItem = {
        product: selectedProduct.id,
        quantity: 1,
        totalPrice: selectedProduct.basePrice,
        productName: selectedProduct.productName,
      };
      setItems([...items, newItem]);
    }

    setSelectedProduct(null);
    setShowAddItem(false);
  };

  const onFinish = async (values) => {
    const payload = {
      salesPerson: {
        user: userId, // Assuming this remains unchanged
        campaign: "campaign",
        commissionRate: commissionRate,
      },
      customer: {
        name: values.customerName,
        email: values.customerEmail,
        contact: values.customerContact,
        platform: values.customerPlatform,
        accountId: values.accountId,
        profileUrl: values.profileUrl,
      },
      items: items.map((item) => ({
        product: item.product, // Ensure you are using the correct identifier here
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      totalAmount: values.totalAmount, // Ensure this function is defined and returns the correct value
      commissionAmount: values.commissionAmount,
      status: values.status,
    };

    console.log(payload);

    try {
      await addNewOrder(payload);
      console.log("Campaign added successfully");
    } catch (err) {
      console.error("Failed to add campaign:", err);
    }
  };

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
          style={{ maxWidth: 300 }}
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
          user: "salesperson",
          status: "Draft",
          totalAmount: 0,
          commissionAmount: 0,
        }}
      >
        <div className="form__title-row">
          <h2>New Order</h2>
        </div>
        <Divider
          orientation="left"
          style={{ color: "#ffffff", borderColor: "#ffffff" }}
        >
          Order Information
        </Divider>
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
        </Row>
        <Divider
          orientation="left"
          style={{ color: "#ffffff", borderColor: "#ffffff" }}
        >
          Salesperson Information
        </Divider>
        <Row>
          <Col span={12}>
            <Form.Item
              name="campaign"
              label="Campaign"
              rules={[{ required: true, message: "Please select a campaign!" }]}
            >
              <Select
                placeholder="Select campaign"
                style={{ width: "100%" }}
                options={CampaignOptions}
              ></Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <p className="form__created">
              Salesperson: <br></br>
              {userId}
            </p>
          </Col>
          <Col span={6}>
            <h4>Commission Rate: </h4>
            <p>commissionRate%</p>
          </Col>
          <Col span={6}>
            <h4>Commission Amount: </h4>
            <p>
              {new Intl.NumberFormat("en-MY", {
                style: "currency",
                currency: "MYR",
              }).format(0)}
            </p>
          </Col>
        </Row>
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

        <Form.Item
          label="Account ID"
          name="accountId"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter customer account id" />
        </Form.Item>

        <Form.Item
          label="Profile URL"
          name="profileUrl"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter customer's profile URL" />
        </Form.Item>

        <Divider
          orientation="left"
          style={{ color: "#ffffff", borderColor: "#ffffff" }}
        >
          Order Items
        </Divider>
        <Table
          dataSource={items}
          columns={columns}
          pagination={false}
          rowKey="product"
        />
        <Row>
          <Col
            span={24}
            style={{
              marginTop: "1em",
              marginBottom: "1em",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="primary"
              onClick={toggleAddItem}
            >
              {showAddItem ? "Hide Add Product" : "Add Product"}
            </Button>
          </Col>
        </Row>
        {showAddItem && (
          <Card
            title="Add New Item"
            size="small"
          >
            <h3>Add New Item</h3>
            <Row>
              <Col flex="auto">
                <Form.Item label="Select Product">
                  <Select
                    onChange={(productId) =>
                      setSelectedProduct(
                        products.find((p) => p.id === productId)
                      )
                    }
                    placeholder="Select a product"
                    options={ProductOptions}
                  ></Select>
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
          </Card>
        )}
        <Divider
          orientation="left"
          style={{ color: "#ffffff", borderColor: "#ffffff" }}
        >
          Order Total
        </Divider>
        <Row>
          <Col
            span={12}
            style={{ textAlign: "right", marginTop: "1em" }}
          >
            <Form.Item
              name="commissionAmount"
              label="Commission Amount (RM)"
            >
              <InputNumber readOnly />
            </Form.Item>
          </Col>
          <Col
            span={12}
            style={{ textAlign: "right", marginTop: "1em" }}
          >
            <Form.Item
              name="totalAmount"
              label="Total Amount (RM)"
            >
              <InputNumber
                value={calculateTotalAmount()}
                readOnly
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider
          orientation="left"
          style={{ color: "#ffffff", borderColor: "#ffffff" }}
        ></Divider>
        <Row>
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

export default NewOrderForm;
