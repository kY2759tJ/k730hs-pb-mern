import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Layout } from "antd";

const Welcome = () => {
  const { username, isAdmin } = useAuth();
  console.log(useAuth());

  const date = new Date();
  const today = new Intl.DateTimeFormat("en-MY", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);

  const content = (
    <Layout>
      <section
        className="welcome"
        style={{ marginTop: "20px" }}
      >
        <h1>Welcome {username} !</h1>
      </section>
    </Layout>
  );

  return content;
};

export default Welcome;
