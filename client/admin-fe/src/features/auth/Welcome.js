import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Welcome = () => {
  const { username, isAdmin } = useAuth();

  const date = new Date();
  const today = new Intl.DateTimeFormat("en-MY", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);

  const content = (
    <section className="welcome">
      <p>{today}</p>
      <h1>Welcome {username} !</h1>
      {/* USers */}
      {isAdmin && (
        <p>
          <Link to="/dash/users">View User Settings</Link>
        </p>
      )}
      {isAdmin && (
        <p>
          <Link to="/dash/users/new">Add New User Settings</Link>
        </p>
      )}
      {/* Campaigns */}
      <p>
        <Link to="/dash/campaigns">View Campaigns</Link>
      </p>
      <p>
        <Link to="/dash/campaigns/new">Add New Campaign</Link>
      </p>
      {/* Orders */}
      <p>
        <Link to="/dash/orders">View Orders</Link>
      </p>
      <p>
        <Link to="/dash/orders/new">Add New Order</Link>
      </p>
      {/* Products */}
      <p>
        <Link to="/dash/products">View Products</Link>
      </p>
      <p>
        <Link to="/dash/products/new">Add New Product</Link>
      </p>

      {/* Commission Payout */}
      <p>
        <Link to="/dash/commissionPayouts">View Commission Payouts</Link>
      </p>
    </section>
  );

  return content;
};

export default Welcome;
