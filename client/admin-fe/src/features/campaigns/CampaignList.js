import { useGetCampaignsQuery } from "./campaignsApiSlice";
import Campaign from "./Campaign";

const CampaignsList = () => {
  const {
    data: campaigns,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetCampaignsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  let content;

  if (isLoading) content = <p>Loading...</p>;

  if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>;
  }

  if (isSuccess) {
    const { ids } = campaigns;

    const tableContent = ids?.length
      ? ids.map((campaignId) => (
          <Campaign
            key={campaignId}
            campaignId={campaignId}
          />
        ))
      : null;

    content = (
      <table className="table table--campaigns">
        <thead className="table__thead">
          <tr>
            <th
              scope="col"
              className="table__th campaign__status"
            >
              Username
            </th>
            <th
              scope="col"
              className="table__th campaign__created"
            >
              Created
            </th>
            <th
              scope="col"
              className="table__th campaign__updated"
            >
              Updated
            </th>
            <th
              scope="col"
              className="table__th campaign__title"
            >
              Title
            </th>
            <th
              scope="col"
              className="table__th campaign__username"
            >
              Owner
            </th>
            <th
              scope="col"
              className="table__th campaign__edit"
            >
              Edit
            </th>
          </tr>
        </thead>
        <tbody>{tableContent}</tbody>
      </table>
    );
  }

  return content;
};
export default CampaignsList;
