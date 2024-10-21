import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Welcome = () => {
  const { username, isManager, isAdmin } = useAuth();

  const date = new Date();
  const today = new Intl.DateTimeFormat("en-MY", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);

  const content = (
    <section className="welcome">
      <p>{today}</p>

      <h1>Welcome {username} !</h1>

      {(isManager || isAdmin) && (
        <p>
          <Link to="/dash/users">View User Settings</Link>
        </p>
      )}
      {(isManager || isAdmin) && (
        <p>
          <Link to="/dash/users/new">Add New User Settings</Link>
        </p>
      )}

      <p>
        <Link to="/dash/campaigns">View Campaigns</Link>
      </p>

      <p>
        <Link to="/dash/campaigns/new">Add New Campaign</Link>
      </p>
    </section>
  );

  return content;
};

export default Welcome;
