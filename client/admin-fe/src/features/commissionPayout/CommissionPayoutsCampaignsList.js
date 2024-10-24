import React, { useMemo } from "react";
import { useGetCommissionPayoutsCampaignsQuery } from "./commissionPayoutsApiSlice";
import { Space, Table, Tag, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import { useLocation } from "react-router-dom";

const CommissionPayoutsCampaignsList = React.memo(() => {
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
  } = useGetCommissionPayoutsCampaignsQuery(
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
        title: "Campaign",
        key: "campaign",
        dataIndex: "campaign",
        render: (_, { campaignId, campaignTitle }) => (
          <div>
            <p>{campaignTitle}</p>
          </div>
        ),
      },

      {
        title: "Total Commission",
        key: "totalCommission",
        dataIndex: "totalCommission",
        render: (_, { totalCommission }) => (
          <>
            <p>{totalCommission}</p>
          </>
        ),
      },
    ]
    // Dependencies for memoization
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

        return (
          commissionPayout && {
            key: id,
            campaignId: commissionPayout.campaignId,
            campaignTitle: commissionPayout.campaignTitle,

            totalCommission: new Intl.NumberFormat("en-MY", {
              style: "currency",
              currency: "MYR",
            }).format(commissionPayout.totalCommission),
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

export default CommissionPayoutsCampaignsList;
