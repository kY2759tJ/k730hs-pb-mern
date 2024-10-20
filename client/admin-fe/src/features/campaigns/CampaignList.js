import { useGetCampaignsQuery } from "./campaignsApiSlice";
import { Space, Table, Tag, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";

const CampaignsList = () => {
  const { username, isManager, isAdmin } = useAuth();

  const {
    data: campaigns,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetCampaignsQuery("campaignList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const navigate = useNavigate();

  let content;

  if (isLoading) content = <PulseLoader color={"#FFF"} />;

  if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>;
  }

  if (isSuccess) {
    const { ids, entities } = campaigns;

    let filteredIds;
    if (isManager || isAdmin) {
      filteredIds = [...ids];
    } else {
      filteredIds = ids.filter(
        (campaignId) => entities[campaignId].username === username
      );
    }
    const columns = [
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
        render: (text) => <a>{text}</a>,
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
    ];

    const dataSource = ids?.length
      ? filteredIds
          .map((campaignId) => {
            const campaign = campaigns.entities[campaignId];
            if (campaign) {
              return {
                key: campaignId, // Unique key for each row
                status: campaign.status,
                title: campaign.title,
                social_media: campaign.social_media,
                post_type: campaign.post_type,
                post_url: campaign.post_url,
                action: campaignId, // Placeholder for action column (e.g., for edit button)
              };
            }
            return null; // Explicitly return null if campaign is not found
          })
          .filter(Boolean) // Remove null values
      : [];

    content = (
      <Table
        columns={columns}
        dataSource={dataSource}
      />
    );
  }

  return content;
};
export default CampaignsList;
