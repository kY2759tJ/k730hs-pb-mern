import { Outlet } from "react-router-dom";
import DashHeader from "./DashHeader";
import DashFooter from "./DashFooter";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu } from "antd";
import { Link } from "react-router-dom";

const { Header, Sider } = Layout;

const items2 = [
  {
    key: "1",
    icon: <UserOutlined />,
    label: <Link to="/dash/users">Users</Link>,
    children: [
      { key: "1-1", label: <Link to="/dash/users">View User Settings</Link> },
      { key: "1-2", label: <Link to="/dash/users/new">Add New User</Link> },
    ],
  },
  {
    key: "2",
    icon: <LaptopOutlined />,
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
    icon: <NotificationOutlined />,
    label: <Link to="/dash/orders">Orders</Link>,
    children: [
      { key: "3-1", label: <Link to="/dash/orders">View Orders</Link> },
      { key: "3-2", label: <Link to="/dash/orders/new">Add New Order</Link> },
    ],
  },
];
const DashLayout = () => {
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
          <h1>SMPost Dashboard</h1>
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
