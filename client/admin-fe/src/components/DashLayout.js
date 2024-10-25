import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSendLogoutMutation } from "../features/auth/authApiSlice";

//import DashHeader from "./DashHeader";
//import DashFooter from "./DashFooter";
import {
  AppstoreAddOutlined,
  NotificationOutlined,
  UserOutlined,
  LogoutOutlined,
  AccountBookOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";

const { Header, Sider } = Layout;

const DASH_REGEX = /^\/dash(\/)?$/;
const NOTES_REGEX = /^\/dash\/campaigns(\/)?$/;
const USERS_REGEX = /^\/dash\/users(\/)?$/;

const DashLayout = () => {
  const { isAdmin } = useAuth();

  const navigate = useNavigate();
  const { pathname } = useLocation();

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
            key: "1",
            icon: <UserOutlined />,
            label: <Link to="/dash/users">Users</Link>,
            children: [
              {
                key: "1-1",
                label: <Link to="/dash/users">View User Settings</Link>,
              },
              {
                key: "1-2",
                label: <Link to="/dash/users/new">Add New User</Link>,
              },
            ],
          },
        ]
      : []), // If not admin, add no items
    {
      key: "2",
      icon: <NotificationOutlined />,
      label: <Link to="/dash/campaigns">Campaigns</Link>,
      children: [
        { key: "2-1", label: <Link to="/dash/campaigns">View Campaigns</Link> },
        {
          key: "2-2",
          label: <Link to="/dash/campaigns/new">Add New Campaign</Link>,
        },
      ],
    },
    {
      key: "3",
      icon: <AppstoreAddOutlined />,
      label: <Link to="/dash/orders">Orders</Link>,
      children: [
        { key: "3-1", label: <Link to="/dash/orders">View Orders</Link> },
        { key: "3-2", label: <Link to="/dash/orders/new">Add New Order</Link> },
      ],
    },
    {
      key: "4",
      icon: <AccountBookOutlined />,
      label: <Link to="/dash/commissionPayouts">Commissions</Link>,
      children: [
        {
          key: "4-1",
          label: <Link to="/dash/commissionPayouts">View Commissions</Link>,
        },
      ],
    },
    {
      key: "4",
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
