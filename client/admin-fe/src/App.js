import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./features/auth/Login";
import DashLayout from "./components/DashLayout";
import Welcome from "./features/auth/Welcome";
import CampaignsList from "./features/campaigns/CampaignsList";
import UsersList from "./features/users/UsersList";
import EditUser from "./features/users/EditUser";
import NewUserForm from "./features/users/NewUserForm";
import EditCampaign from "./features/campaigns/EditCampaign";
import NewCampaign from "./features/campaigns/NewCampaign";
import ProductsList from "./features/products/ProductsList";
import EditProduct from "./features/products/EditProduct";
import NewProduct from "./features/products/NewProduct";
import Prefetch from "./features/auth/Prefetch";
import PersistLogin from "./features/auth/PersistLogin";
import { ROLES } from "./config/enums";
import RequireAuth from "./features/auth/RequireAuth";
import useTitle from "./hooks/useTitle";
import OrdersList from "./features/orders/OrdersList";
import EditOrder from "./features/orders/EditOrder";
import NewOrder from "./features/orders/NewOrder";
import CommissionPayoutsList from "./features/commissionPayout/commissionPayoutsList";
import CommissionPayoutsCampaignsList from "./features/commissionPayout/CommissionPayoutsCampaignsList";

function App() {
  useTitle("SMPost Dashboard");
  return (
    <Routes>
      <Route
        path="/"
        element={<Layout />}
      >
        {/* Public routes*/}
        <Route
          index
          element={<Public />}
        />
        <Route
          path="login"
          element={<Login />}
        />

        {/* Proctected routes */}
        <Route element={<PersistLogin />}>
          <Route
            element={<RequireAuth allowedRoles={[...Object.values(ROLES)]} />}
          >
            <Route element={<Prefetch />}>
              <Route
                path="dash"
                element={<DashLayout />}
              >
                <Route
                  index
                  element={<Welcome />}
                />
                <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                  <Route path="users">
                    <Route
                      index
                      element={<UsersList />}
                    />
                    <Route
                      path=":id"
                      element={<EditUser />}
                    />
                    <Route
                      path="new"
                      element={<NewUserForm />}
                    />
                  </Route>
                </Route>

                <Route path="campaigns">
                  <Route
                    index
                    element={<CampaignsList />}
                  />
                  <Route
                    path=":id"
                    element={<EditCampaign />}
                  />
                  <Route
                    path="new"
                    element={<NewCampaign />}
                  />
                </Route>

                <Route path="orders">
                  <Route
                    index
                    element={<OrdersList />}
                  />
                  <Route
                    path=":id"
                    element={<EditOrder />}
                  />
                  <Route
                    path="new"
                    element={<NewOrder />}
                  />
                </Route>

                <Route path="products">
                  <Route
                    index
                    element={<ProductsList />}
                  />
                  <Route
                    path=":id"
                    element={<EditProduct />}
                  />
                  <Route
                    path="new"
                    element={<NewProduct />}
                  />
                </Route>

                <Route path="commissionPayouts">
                  <Route
                    index
                    element={<CommissionPayoutsList />}
                  />
                  <Route
                    path="details"
                    //element={<CommissionPayoutsList />}
                    element={<CommissionPayoutsCampaignsList />}
                  />
                </Route>
              </Route>
              {/* End Dash */}
            </Route>
          </Route>
          {/* End Protected routes*/}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
