import React, { useMemo } from "react";
import { useGetOrdersQuery } from "./ordersApiSlice";
import { Space, Table, Tag, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";

const OrdersList = React.memo(() => {
  const { username, isAdmin } = useAuth();

  const {
    data: orders,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetOrdersQuery("ordersList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        title: "Order ID",
        key: "status",
        dataIndex: "status",
        render: (_, { status, orderId }) => (
          <div>
            <Tag color={status === "Active" ? "green" : "grey"}>
              {status.toUpperCase()}
            </Tag>
            <p>#{orderId}</p>
          </div>
        ),
      },
      {
        title: "Order Items",
        dataIndex: "items",
        key: "items",
        render: (items) =>
          items.map((item) => (
            <div key={item._id}>
              <p>
                {item.quantity}x {item.productName}
              </p>
            </div>
          )),
      },
      {
        title: "Customer",
        dataIndex: "customer",
        key: "customer",
        render: (_, { customer }) => (
          <div>
            <p>{customer.name}</p>
            <p>{customer.email}</p>
            <p>{customer.contact}</p>
            <p>
              <a
                href={customer.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View {customer.platform} Profile
              </a>
            </p>
          </div>
        ),
      },
      {
        title: "Total",
        dataIndex: "totalAmount",
        key: "totalAmount",
        render: (text) => <p>{text}</p>, // Added href for proper link
      },
      {
        title: "Commission Amount",
        dataIndex: "commissionAmount",
        key: "commissionAmount",
        render: (text) => <p>{text}</p>, // Added href for proper link
      },
      {
        title: "Salesperson",
        dataIndex: "user",
        key: "user",
        render: (_, { campaign, user, commissionRate }) => (
          <div>
            <p>{campaign}</p>
            <p>{user}</p>
            <p>{commissionRate}%</p>
          </div>
        ), // Added href for proper link
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => navigate(`/dash/orders/${record.action}`)}
            />
          </Space>
        ),
      },
    ],
    [navigate] // Dependencies for memoization
  );

  const dataSource = useMemo(() => {
    if (!isSuccess) return [];
    const { ids, entities } = orders;

    const filteredIds = isAdmin
      ? ids
      : ids.filter((id) => entities[id].username === username);

    return filteredIds
      .map((id) => {
        const order = entities[id];
        return (
          order && {
            key: id,
            orderId: order.orderId,
            status: order.status,
            campaign: order.campaign,
            customer: order.customer,
            items: order.itemsWithProductNames,
            totalAmount: new Intl.NumberFormat("en-MY", {
              style: "currency",
              currency: "MYR",
            }).format(order.totalAmount),
            user: order.username,
            commissionRate: order.salesPerson.commissionRate,
            commissionAmount: new Intl.NumberFormat("en-MY", {
              style: "currency",
              currency: "MYR",
            }).format(order.commissionAmount),
            action: id,
          }
        );
      })
      .filter(Boolean); // Remove null values
  }, [orders, isAdmin, isSuccess, username]);

  let content;

  if (isLoading) {
    content = <PulseLoader color={"#FFF"} />;
  } else if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>;
  } else {
    content = (
      <Table
        columns={columns}
        dataSource={dataSource}
      />
    );
  }

  return content;
});

export default OrdersList;
