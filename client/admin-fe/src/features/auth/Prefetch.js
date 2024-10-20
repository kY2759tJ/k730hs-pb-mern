import { store } from "../../app/store";
import { campaignsApiSlice } from "../campaigns/campaignsApiSlice";
import { usersApiSlice } from "../users/usersApiSlice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const Prefetch = () => {
  useEffect(() => {
    store.dispatch(
      campaignsApiSlice.util.prefetch("getCampaigns", "campaignsList", {
        force: true,
      })
    );
    store.dispatch(
      usersApiSlice.util.prefetch("getUsers", "", { force: true })
    );
  }, []);

  return <Outlet />;
};
export default Prefetch;
