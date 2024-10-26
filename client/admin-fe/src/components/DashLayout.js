import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useSendLogoutMutation } from "../features/auth/authApiSlice";

import {
  AppstoreAddOutlined,
  NotificationOutlined,
  UserOutlined,
  LogoutOutlined,
  AccountBookOutlined,
  BorderOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";

const { Header, Sider } = Layout;

const DashLayout = () => {
  const { isAdmin } = useAuth();

  const navigate = useNavigate();

  const [sendLogout, { isLoading, isSuccess, isError, error }] =
    useSendLogoutMutation();

  const handleLogout = async () => {
    try {
      await sendLogout().unwrap(); // Ensure the mutation completes successfully
      navigate("/login"); // Navigate to the login page immediately
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const items2 = [
    ...(isAdmin
      ? [
          {
            key: "Users",
            icon: <UserOutlined />,
            label: <Link to="/dash/users">Users</Link>,
            children: [
              {
                key: "Users-1",
                label: <Link to="/dash/users">View User Settings</Link>,
              },
              {
                key: "Users-2",
                label: <Link to="/dash/users/new">Add New User</Link>,
              },
            ],
          },
        ]
      : []), // If not admin, add no items
    {
      key: "Campaigns",
      icon: <NotificationOutlined />,
      label: <Link to="/dash/campaigns">Campaigns</Link>,
      children: [
        {
          key: "Campaigns-1",
          label: <Link to="/dash/campaigns">View Campaigns</Link>,
        },
        {
          key: "Campaigns-2",
          label: <Link to="/dash/campaigns/new">Add New Campaign</Link>,
        },
      ],
    },
    {
      key: "Orders",
      icon: <AppstoreAddOutlined />,
      label: <Link to="/dash/orders">Orders</Link>,
      children: [
        { key: "Orders-1", label: <Link to="/dash/orders">View Orders</Link> },
        {
          key: "Orders-2",
          label: <Link to="/dash/orders/new">Add New Order</Link>,
        },
      ],
    },
    {
      key: "Products",
      icon: <BorderOutlined />,
      label: <Link to="/dash/products">Products</Link>,
      children: [
        {
          key: "Products-1",
          label: <Link to="/dash/products">View Products</Link>,
        },
        {
          key: "Products-2",
          label: <Link to="/dash/products/new">Add New Product</Link>,
        },
      ],
    },
    {
      key: "5",
      icon: <AccountBookOutlined />,
      label: <Link to="/dash/commissionPayouts">Commissions</Link>,
      children: [
        {
          key: "5-1",
          label: <Link to="/dash/commissionPayouts">View Commissions</Link>,
        },
      ],
    },
    {
      key: "6",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout, // Add the onClick handler here
    },
  ];

  return (
    <>
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="demo-logo" />
          <Link to="/dash">
            <h1>SMPost Dashboard</h1>
          </Link>
        </Header>
        <Layout>
          <Sider width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={["1"]}
              defaultOpenKeys={["sub1"]}
              style={{
                height: "100%",
                borderRight: 0,
              }}
              items={items2}
            />
          </Sider>
          <Layout
            style={{
              padding: "0 24px 24px",
            }}
          >
            <Outlet />
          </Layout>
        </Layout>
      </Layout>
    </>
  );
};

export default DashLayout;
