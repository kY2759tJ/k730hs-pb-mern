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
import Prefetch from "./features/auth/Prefetch";
import PersistLogin from "./features/auth/PersistLogin";
import { ROLES } from "./config/enums";
import RequireAuth from "./features/auth/RequireAuth";
import useTitle from "./hooks/useTitle";

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
