import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./features/auth/Login";
import DashLayout from "./components/DashLayout";
import Welcome from "./features/auth/Welcome";
import CampaignList from "./features/campaigns/CampaignList";
import UserList from "./features/users/UserList";

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
        ></Route>
        <Route
          path="login"
          element={<Login />}
        ></Route>
      </Route>
      <Route
        path="dash"
        element={<DashLayout />}
      >
        <Route
          index
          element={<Welcome />}
        ></Route>
        <Route path="campaigns">
          <Route
            index
            element={<CampaignList />}
          ></Route>
        </Route>
        <Route path="users">
          <Route
            index
            element={<UserList />}
          ></Route>
        </Route>
      </Route>
      {/*End Dash */}
    </Routes>
  );
}

export default App;
