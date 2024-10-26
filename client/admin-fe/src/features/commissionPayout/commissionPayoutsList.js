import React, { useMemo } from "react";
import { useGetCommissionPayoutsQuery } from "./commissionPayoutsApiSlice";
import { Space, Table, Tag, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import { useLocation } from "react-router-dom";

const CommissionPayoutsList = React.memo(() => {
  const location = useLocation();

  // Extract yearMonth query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const yearMonth = queryParams.get("yearMonth");
  const salesPerson = queryParams.get("salesPerson");

  const { username, isAdmin } = useAuth();

  const {
    data: commissionPayouts,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetCommissionPayoutsQuery(
    { yearMonth, salesPerson },
    {
      pollingInterval: 15000,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        title: "Commission Payout ID",
        key: "status",
        dataIndex: "status",
        render: (_, { status, commissionPayoutId }) => (
          <div>
            <Tag color={status === "Active" ? "green" : "grey"}>
              {status.toUpperCase()}
            </Tag>
            <p>#{commissionPayoutId}</p>
          </div>
        ),
      },
      {
        title: "Year Month",
        key: "yearMonth",
        dataIndex: "yearMonth",
        render: (_, { yearMonth }) => <p>{yearMonth}</p>,
      },
      {
        title: "Salesperson",
        key: "salesperson",
        dataIndex: "salesperson",
        render: (_, { fullname, username }) => (
          <>
            <p>{fullname}</p>
            <p>{username}</p>
          </>
        ),
      },
      {
        title: "Total Payout",
        key: "totalPayout",
        dataIndex: "totalPayout",
        render: (_, { totalPayout }) => <p>{totalPayout}</p>,
      },

      {
        title: "Timestamp",
        key: "timestamp",
        dataIndex: "timestamp",
        render: (_, { createdAt, updatedAt }) => (
          <>
            <p>Created {createdAt}</p>
            <p>Updated {updatedAt}</p>
          </>
        ),
      },
      {
        title: "Action",
        key: "action",
        render: (_, { yearMonth, salesPerson }) => (
          <Space size="middle">
            <Button
              type="primary"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() =>
                navigate(
                  `/dash/commissionPayouts/details?yearMonth=${yearMonth}&salesPerson=${salesPerson}`
                )
              }
            />
          </Space>
        ),
      },
    ],
    [navigate] // Dependencies for memoization
  );

  const dataSource = useMemo(() => {
    if (!isSuccess) return [];
    const { ids, entities } = commissionPayouts;

    const filteredIds = isAdmin
      ? ids
      : ids.filter((id) => entities[id].username === username);

    return filteredIds
      .map((id) => {
        const commissionPayout = entities[id];
        const created = new Date(commissionPayout.createdAt).toLocaleString(
          "en-MY",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }
        );
        const updated = new Date(commissionPayout.updatedAt).toLocaleString(
          "en-MY",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }
        );

        return (
          commissionPayout && {
            key: id,
            commissionPayoutId: commissionPayout.commissionPayoutId,
            status: commissionPayout.status,
            createdAt: created,
            updatedAt: updated,
            yearMonth: commissionPayout.yearMonth,
            fullname: commissionPayout.fullname,
            username: commissionPayout.username,
            salesPerson: commissionPayout.salesPerson,
            totalPayout: new Intl.NumberFormat("en-MY", {
              style: "currency",
              currency: "MYR",
            }).format(commissionPayout.totalPayout),
            action: id,
          }
        );
      })
      .filter(Boolean); // Remove null values
  }, [commissionPayouts, isAdmin, isSuccess, username]);

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

export default CommissionPayoutsList;
