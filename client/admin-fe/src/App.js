import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./features/auth/Login";
import DashLayout from "./components/DashLayout";
import Welcome from "./features/auth/Welcome";
import CampaignList from "./features/campaigns/CampaignList";
import UserList from "./features/users/UserList";
import EditUser from "./features/users/EditUser";
import NewUserForm from "./features/users/NewUserForm";
import EditCampaign from "./features/campaigns/EditCampaign";
import NewCampaign from "./features/campaigns/NewCampaign";
import Prefetch from "./features/auth/Prefetch";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Layout />}
      >
        <Route
          index
          element={<Public />}
        />
        <Route
          path="login"
          element={<Login />}
        />
      </Route>
      <Route element={<Prefetch />}>
        <Route
          path="dash"
          element={<DashLayout />}
        >
          <Route
            index
            element={<Welcome />}
          />
          <Route path="users">
            <Route
              index
              element={<UserList />}
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
          <Route path="campaigns">
            <Route
              index
              element={<CampaignList />}
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
      </Route>
      {/*End Dash */}
    </Routes>
  );
}

export default App;
