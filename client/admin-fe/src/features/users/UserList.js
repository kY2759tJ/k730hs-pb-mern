import { useGetUsersQuery } from "./usersApiSlice";
import { Space, Table, Tag, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const UserList = () => {
  const {
    data: users,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetUsersQuery(undefined, {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const navigate = useNavigate();

  let content;

  if (isLoading) content = <p>Loading...</p>;

  if (isError) {
    content = <p className="errmsg">{error?.data?.messusername}</p>;
  }

  if (isSuccess) {
    const { ids } = users;

    const columns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (text) => <a>{text}</a>,
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
    ];

    const dataSource = ids?.length
      ? ids.map((userId) => {
          const user = users.entities[userId];
          if (user) {
            return {
              key: userId, // Unique key for each row
              name: user.name,
              username: user.username,
              roles: user.roles,
              action: userId, // Placeholder for action column (for edit button)
            };
          }
        })
      : null;

    content = (
      <Table
        columns={columns}
        dataSource={dataSource}
      />
    );
  }

  return content;
};

export default UserList;
