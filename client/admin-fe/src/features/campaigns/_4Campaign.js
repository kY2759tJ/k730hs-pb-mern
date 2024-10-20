import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";
import { selectCampaignById } from "./campaignsApiSlice";

const Campaign = ({ campaignId }) => {
  const campaign = useSelector((state) =>
    selectCampaignById(state, campaignId)
  );

  const navigate = useNavigate();

  if (campaign) {
    const created = new Date(campaign.createdAt).toLocaleString("en-US", {
      day: "numeric",
      month: "long",
    });

    const updated = new Date(campaign.updatedAt).toLocaleString("en-US", {
      day: "numeric",
      month: "long",
    });

    const handleEdit = () => navigate(`/dash/campaigns/${campaignId}`);

    return (
      <tr className="table__row">
        <td className="table__cell campaign__status">
          {campaign.completed ? (
            <span className="campaign__status--completed">Completed</span>
          ) : (
            <span className="campaign__status--open">Open</span>
          )}
        </td>
        <td className="table__cell campaign__created">{created}</td>
        <td className="table__cell campaign__updated">{updated}</td>
        <td className="table__cell campaign__title">{campaign.title}</td>
        <td className="table__cell campaign__username">{campaign.username}</td>

        <td className="table__cell">
          <button
            className="icon-button table__button"
            onClick={handleEdit}
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        </td>
      </tr>
    );
  } else return null;
};
export default Campaign;
