import { Link } from "react-router-dom";

import React from "react";

const Public = () => {
  const content = (
    <section className="public">
      <header>
        <h1>
          Welcome to <span className="nowrap">SMPost Dashboard!</span>
        </h1>
      </header>

      <footer>
        <Link to="/login"> Login</Link>
      </footer>
    </section>
  );
  return content;
};

export default Public;
