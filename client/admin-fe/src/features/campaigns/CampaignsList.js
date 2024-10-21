import React, { useMemo } from "react";
import { useGetCampaignsQuery } from "./campaignsApiSlice";
import { Space, Table, Tag, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";

const CampaignsList = React.memo(() => {
  const { username, isAdmin } = useAuth();

  const {
    data: campaigns,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetCampaignsQuery("campaignsList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        title: "Status",
        key: "status",
        dataIndex: "status",
        render: (status) => (
          <Tag color={status === "Active" ? "green" : "grey"}>
            {status.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: "Campaign Title",
        key: "title",
        dataIndex: "title",
        render: (text) => <p>{text}</p>,
      },
      {
        title: "Social Media",
        dataIndex: "social_media",
        key: "social_media",
      },
      {
        title: "Post Type",
        dataIndex: "post_type",
        key: "post_type",
      },
      {
        title: "Post URL",
        dataIndex: "post_url",
        key: "post_url",
        render: (text) => <a href={text}>{text}</a>, // Added href for proper link
      },
      {
        title: "User",
        key: "user",
        dataIndex: "user",
        render: (text) => <p>{text}</p>,
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
              onClick={() => navigate(`/dash/campaigns/${record.action}`)}
            />
          </Space>
        ),
      },
    ],
    [navigate] // Dependencies for memoization
  );

  const dataSource = useMemo(() => {
    if (!isSuccess) return [];
    const { ids, entities } = campaigns;

    const filteredIds = isAdmin
      ? ids
      : ids.filter((id) => entities[id].username === username);

    return filteredIds
      .map((id) => {
        const campaign = entities[id];
        return (
          campaign && {
            key: id,
            status: campaign.status,
            title: campaign.title,
            social_media: campaign.social_media,
            post_type: campaign.post_type,
            post_url: campaign.post_url,
            user: campaign.username,
            action: id,
          }
        );
      })
      .filter(Boolean); // Remove null values
  }, [campaigns, isAdmin, isSuccess, username]);

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

export default CampaignsList;
