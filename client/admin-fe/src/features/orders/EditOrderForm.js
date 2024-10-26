import { useState, useEffect } from "react";
import {
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from "./ordersApiSlice";
import { useUpdateCommissionPayoutMutation } from "../commissionPayout/commissionPayoutsApiSlice";
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
  Card,
  Space,
  Modal,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { OrderStatuses, CustomerPlatforms } from "../../config/enums";
import { addProductToList, onEditProduct } from "../../utils/productUtils";
import NewProductForm from "../products/NewProductForm";
import EditProductForm from "../products/EditProductForm";

function formatDateToYearMonth(dateString) {
  // Create a Date object from the string
  const date = new Date(dateString);

  // Extract the year and month
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "short" }); // Get the short month name

  // Combine them into the desired format
  return `${year}-${month}`;
}

const EditOrderForm = ({ order, products: initialProducts }) => {
  const [updateOrder, { isLoading, isSuccess, isError, error }] =
    useUpdateOrderMutation();

  const [updateCommissionPayout] = useUpdateCommissionPayoutMutation(); // Create commission payout mutation

  const [
    deleteOrder,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteOrderMutation();

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();
  const [items, setItems] = useState(order.itemsWithProductNames);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Track product being edited

  const commissionRate = order.salesPerson.commissionRate;

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      form.resetFields();
      navigate("/dash/orders");
    }
  }, [isSuccess, isDelSuccess, navigate, form]);

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

  // Handle add new product
  const handleNewProduct = (product) => {
    addProductToList(product, setProducts, setItems);
    setIsProductModalOpen(false); // Close the modal
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
        basePrice: selectedProduct.basePrice,
        totalPrice: selectedProduct.basePrice,
        productName: selectedProduct.productName,
      };
      setItems([...items, newItem]);
    }

    setSelectedProduct(null);
    setShowAddItem(false);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product); // Set the product to edit
    setIsEditProductModalOpen(true); // Open the edit modal
  };

  const onFinish = async (values) => {
    const payload = {
      id: order.id,
      salesPerson: {
        user: order.salesPerson.user, // Assuming this remains unchanged
        campaign: order.salesPerson.campaign,
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
      const result = await updateOrder(payload).unwrap();
      console.log("Updated order successfully", result);

      const updatedOrder = {
        order: order.id,
        commissionRate: commissionRate,
        commissionAmount: values.commissionAmount,
      };

      console.log("result:", result);
      console.log("newOrder:", updatedOrder);

      const yearMonth = formatDateToYearMonth(order.createdAt);

      const newCommissionPayout = {
        salesPerson: order.salesPerson.user,
        yearMonth: yearMonth,
        campaignId: order.salesPerson.campaign,
        order: updatedOrder,
      };

      console.log("updateCommissionPayout:", newCommissionPayout);

      const payoutResult = await updateCommissionPayout(newCommissionPayout); // Example payout
      console.log("Commission payout created successfully:", payoutResult);
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const onDeleteOrder = async () => {
    await deleteOrder({ id: order.id });

    const cpYearMonth = formatDateToYearMonth(order.createdAt);

    const deletedOrder = {
      order: order.id,
      action: "delete",
    };

    const deleteCommissionPayout = {
      salesPerson: order.salesPerson.user,
      yearMonth: cpYearMonth,
      campaignId: order.salesPerson.campaign,
      order: deletedOrder,
    };

    console.log("updateCommissionPayout:", deleteCommissionPayout);
    const payoutResult = await updateCommissionPayout(deleteCommissionPayout); // Example payout
    console.log("Commission payout created successfully:", payoutResult);
    message.success(
      "Campaign deleted and commission recalculated successfully"
    );
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
            //onClick={() => navigate(`/dash/products/${record.product}`)}
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
          user: order.user,
          status: order.status,
          orderId: order.orderId,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          customerContact: order.customer.contact,
          customerPlatform: order.customer.platform,
          accountId: order.customer.accountId,
          profileUrl: order.customer.profileUrl,
          totalAmount: order.totalAmount,
          commissionAmount: order.commissionAmount,
        }}
      >
        <div className="form__title-row">
          <h2>Edit Order #{order.orderId}</h2>
        </div>
        <Divider orientation="left">Order Information</Divider>
        <Row>
          <Col span={12}>
            <p className="form__created">
              Date Created:
              <br />
              {created}
            </p>
          </Col>
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
          <Col span={6}>
            <p className="form__created">
              Campaign: <br></br> {order.campaign}
            </p>
          </Col>
          <Col span={6}>
            <p className="form__created">
              Salesperson: <br></br>
              {order.fullname}
            </p>
          </Col>
          <Col span={6}>
            <h4>Commission Rate: </h4>
            <p>{order.salesPerson.commissionRate}%</p>
          </Col>
          <Col span={6}>
            <h4>Commission Amount: </h4>
            <p>
              {new Intl.NumberFormat("en-MY", {
                style: "currency",
                currency: "MYR",
              }).format(order.commissionAmount)}
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
        )}
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
        <Row>
          <Col>
            <Button
              type="primary"
              danger
              title="Save"
              icon={<DeleteOutlined />}
              loading={isLoading}
              disabled={isLoading}
              onClick={onDeleteOrder}
            >
              Delete
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
