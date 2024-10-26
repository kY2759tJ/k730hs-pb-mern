import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Form, Input, Checkbox, message } from "antd";
import { useDispatch } from "react-redux";
import { setCredentials } from "./authSlice";
import { useLoginMutation } from "./authApiSlice";
import usePersist from "../../hooks/usePersist";
import PulseLoader from "react-spinners/PulseLoader";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const userRef = useRef();
  const { userId } = useAuth();
  console.log(useAuth());

  const [errMsg, setErrMsg] = useState("");
  const [persist, setPersist] = usePersist();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    userRef.current.focus();
  }, []);

  const onFinish = async (values) => {
    const { username, password } = values;
    try {
      const { accessToken } = await login({ username, password }).unwrap();
      dispatch(setCredentials({ accessToken }));
      localStorage.setItem("accessToken", accessToken);
      navigate("/dash", { replace: true });
    } catch (err) {
      if (!err.status) {
        setErrMsg("No Server Response");
      } else if (err.status === 400) {
        setErrMsg("Missing Username or Password");
      } else if (err.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg(err.data?.message);
      }
      message.error(errMsg); // Display error using Ant Design message
    }
  };

  useEffect(() => {
    if (userId) {
      navigate("/dash", { replace: true });
    }
  }, [userId, navigate]);

  const onPersistChange = (e) => setPersist(e.target.checked);

  const errClass = errMsg ? "errmsg" : "offscreen";

  if (isLoading) return <PulseLoader color={"#FFF"} />;

  const content = (
    <section className="public">
      <header>
        <h1>Login</h1>
      </header>
      <main className="login">
        <p
          ref={userRef}
          className={errClass}
          aria-live="assertive"
        >
          {errMsg}
        </p>

        <Form
          name="login-form"
          layout="vertical"
          onFinish={onFinish}
          className="form"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input
              ref={userRef}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="persist"
            valuePropName="checked"
          >
            <Checkbox
              onChange={onPersistChange}
              checked={persist}
            >
              Remember me
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="form__submit-button"
              loading={isLoading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </main>
      <footer>
        <Link to="/">Back to Home</Link>
      </footer>
    </section>
  );

  return content;
};
export default Login;
