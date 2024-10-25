import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddNewOrderMutation } from "./ordersApiSlice";
import { useUpdateCommissionPayoutMutation } from "../commissionPayout/commissionPayoutsApiSlice";
import NewProductForm from "../products/NewProductForm";
import EditProductForm from "../products/EditProductForm";
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
  message,
  Modal,
  Space,
} from "antd";
import { CustomerPlatforms, OrderStatuses } from "../../config/enums";
import { EditOutlined } from "@ant-design/icons";
import { addProductToList, onEditProduct } from "../../utils/productUtils";

// URL validation rule
const urlValidationRule = {
  type: "url",
  message: "Please enter a valid URL!",
};

const getCurrentYearMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    date
  );
  return `${year}-${month}`;
};

const yearMonth = getCurrentYearMonth();

const NewOrderForm = ({ user, campaigns, products: initialProducts }) => {
  const [addNewOrder, { isLoading, isSuccess, isError, error }] =
    useAddNewOrderMutation();

  const [updateCommissionPayout] = useUpdateCommissionPayoutMutation(); // Create commission payout mutation

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();

  //User
  //console.log("user ", user.id);
  const commissionRate = user.commissionRate;

  const [products, setProducts] = useState(initialProducts);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Track product being edited

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

  const handleNewProduct = (product) => {
    console.log("handleNewProduct ", product);
    addProductToList(product, setProducts, setItems);
    setIsProductModalOpen(false); // Close the modal
  };

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

  // Handle edit product
  const handleEditProduct = (updatedProduct) => {
    onEditProduct(
      updatedProduct,
      products,
      items,
      setProducts,
      setItems,
      calculateTotalAmount,
      calculateCommission,
      commissionRate,
      form
    );
    setIsEditProductModalOpen(false); // Close modal
  };

  const openEditProductModal = (product) => {
    const editProduct = {};
    setEditingProduct(product); // Set the product to edit
    setIsEditProductModalOpen(true); // Open the edit modal
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
        basePrice: selectedProduct.basePrice,
        totalPrice: selectedProduct.basePrice,
        productName: selectedProduct.productName,
      };
      setItems([...items, newItem]);
    }

    setSelectedProduct(null);
  };

  const onFinish = async (values) => {
    const payload = {
      salesPerson: {
        user: user.id, // Assuming this remains unchanged
        campaign: values.campaign,
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
      const result = await addNewOrder(payload).unwrap();
      console.log("Order added successfully", result);

      const newOrder = {
        order: result.id,
        commissionRate: commissionRate,
        commissionAmount: values.commissionAmount,
      };

      console.log("result:", result);
      console.log("newOrder:", newOrder);

      const newCommissionPayout = {
        salesPerson: user.id,
        yearMonth: yearMonth,
        campaignId: values.campaign,
        order: newOrder,
      };

      console.log("newCommissionPayout:", newCommissionPayout);

      const payoutResult = await updateCommissionPayout(newCommissionPayout); // Example payout
      console.log("Commission payout created successfully:", payoutResult);
    } catch (err) {
      console.error("Failed to add order:", err);
    }
  };

  // Columns for the items table
  const columns = [
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() =>
              openEditProductModal({
                id: record.product,
                productName: record.productName,
                basePrice: record.basePrice,
              })
            }
          />
        </Space>
      ),
    },
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
        <Divider orientation="left">Order Information</Divider>
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
        <Divider orientation="left">Salesperson Information</Divider>
        <Row>
          <Col span={16}>
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
          <Col span={8}>
            <h4>Commission Rate: </h4>
            <p>{commissionRate}%</p>
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
        <Divider orientation="left">Customer Information</Divider>

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

        <Divider orientation="left">Order Items</Divider>
        <Row>
          <Col
            span={24}
            style={{
              marginTop: "1em",
              marginBottom: "1em",
              display: "flex",
              justifyContent: "flex-end",
            }}
          ></Col>
        </Row>
        <Card
          title="Add New Item"
          size="small"
          style={{ marginBottom: "1em" }}
        >
          <Row>
            <Col flex="auto">
              <Form.Item label="Select Product">
                <Select
                  placeholder="Select or Add Product"
                  style={{ width: "100%" }}
                  value={selectedProduct?.id}
                  onChange={(id) =>
                    setSelectedProduct(products.find((p) => p.id === id))
                  }
                  options={ProductOptions}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="link"
                        block
                        onClick={() => setIsProductModalOpen(true)}
                      >
                        + Add New Product
                      </Button>
                    </>
                  )}
                />
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

        <Table
          dataSource={items}
          columns={columns}
          pagination={false}
          rowKey="product"
        />

        <Modal
          title="Add New Product"
          open={isProductModalOpen}
          onCancel={() => setIsProductModalOpen(false)}
          footer={null}
        >
          <NewProductForm
            onAddProduct={handleNewProduct}
            isInModal={true}
          />
        </Modal>

        <Modal
          title="Edit Product"
          open={isEditProductModalOpen}
          onCancel={() => setIsEditProductModalOpen(false)}
          footer={null}
        >
          {editingProduct && (
            <EditProductForm
              product={editingProduct}
              isInModal={true}
              onClose={() => setIsEditProductModalOpen(false)}
              onEditProduct={handleEditProduct}
            />
          )}
        </Modal>

        <Divider orientation="left">Order Total</Divider>
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

        <Divider orientation="left"></Divider>
        <Row>
          <Col span={12}>
            <Button
              type="primary"
              title="Save"
              htmlType="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Add Order
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
