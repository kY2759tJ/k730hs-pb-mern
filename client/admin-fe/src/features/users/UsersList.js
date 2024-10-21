import React, { useMemo } from "react";
import { useGetUsersQuery } from "./usersApiSlice";
import { Space, Table, Tag, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";

// Utility function to capitalize names
const capitalizeName = (fullname) =>
  fullname
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const UsersList = React.memo(() => {
  const {
    data: users,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetUsersQuery("usersList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        title: "Active",
        key: "active",
        dataIndex: "active",
        render: (isActive) => (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        ),
      },
      {
        title: "Full Name",
        key: "fullname",
        dataIndex: "fullname",
        render: (text) => <p>{text}</p>,
      },
      {
        title: "Username",
        dataIndex: "username",
        key: "username",
      },
      {
        title: "Roles",
        key: "roles",
        dataIndex: "roles",
        render: (_, { roles }) => (
          <>
            {roles.map((tag) => {
              let color = tag.length > 5 ? "geekblue" : "green";
              return (
                <Tag
                  color={color}
                  key={tag}
                >
                  {tag.toUpperCase()}
                </Tag>
              );
            })}
          </>
        ),
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
              onClick={() => navigate(`/dash/users/${record.action}`)}
            />
          </Space>
        ),
      },
    ],
    [navigate] // Memoized to avoid re-creating on each render
  );

  const dataSource = useMemo(() => {
    if (!isSuccess) return [];
    const { ids, entities } = users;

    return ids
      .map((userId) => {
        const user = entities[userId];
        return (
          user && {
            key: userId, // Unique key for each row
            active: user.active,
            fullname: capitalizeName(user.fullname),
            username: user.username,
            roles: user.roles,
            action: userId, // Used for navigation
          }
        );
      })
      .filter(Boolean); // Remove null values
  }, [users, isSuccess]);

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

export default UsersList;
