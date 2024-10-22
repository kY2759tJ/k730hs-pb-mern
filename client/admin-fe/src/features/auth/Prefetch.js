import { store } from "../../app/store";
import { campaignsApiSlice } from "../campaigns/campaignsApiSlice";
import { usersApiSlice } from "../users/usersApiSlice";
import { ordersApiSlice } from "../orders/ordersApiSlice";
import { productsApiSlice } from "../products/productsApiSlice";
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
      usersApiSlice.util.prefetch("getUsers", "usersList", { force: true })
    );
    store.dispatch(
      ordersApiSlice.util.prefetch("getOrders", "ordersList", { force: true })
    );
    store.dispatch(
      productsApiSlice.util.prefetch("getProducts", "productsList", {
        force: true,
      })
    );
  }, []);

  return <Outlet />;
};
export default Prefetch;
