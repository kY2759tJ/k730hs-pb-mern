import { useState, useEffect } from "react";
import { useAddNewUserMutation } from "./usersApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { ROLES } from "../../config/roles";
import { Form, Input, Button, Select } from "antd";

const NAME_REGEX = /^[a-zA-Z]+([ '-][a-zA-Z]+)*$/;
const USER_REGEX = /^[A-z]{3,20}$/;
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

const NewUserForm = () => {
  const [addNewUser, { isLoading, isSuccess, isError, error }] =
    useAddNewUserMutation();

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [validName, setValidName] = useState(false);
  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [roles, setRoles] = useState(["Salesperson"]);

  useEffect(() => {
    setValidName(NAME_REGEX.test(name));
  }, [name]);

  useEffect(() => {
    setValidUsername(USER_REGEX.test(username));
  }, [username]);

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(password));
  }, [password]);

  useEffect(() => {
    if (isSuccess) {
      setName("");
      setUsername("");
      setPassword("");
      setRoles([]);
      navigate("/dash/users");
    }
  }, [isSuccess, navigate]);

  const onNameChanged = (e) => setName(e.target.value);
  const onUsernameChanged = (e) => setUsername(e.target.value);
  const onPasswordChanged = (e) => setPassword(e.target.value);

  const onRolesChanged = (selectedRoles) => {
    setRoles(selectedRoles);
  };

  const canSave =
    [roles.length, validName, validUsername, validPassword].every(Boolean) &&
    !isLoading;

  const onSaveUserClicked = async (values) => {
    console.log(values);
    if (canSave) {
      await addNewUser({ name, username, password, roles });
    }
  };

  const options = Object.values(ROLES).map((role) => ({
    value: role,
    label: role,
  }));

  console.log(options);

  const errClass = isError ? "errmsg" : "offscreen";
  const validNameClass = !validName ? "form__input--incomplete" : "";
  const validUserClass = !validUsername ? "form__input--incomplete" : "";
  const validPwdClass = !validPassword ? "form__input--incomplete" : "";
  const validRolesClass = !Boolean(roles.length)
    ? "form__input--incomplete"
    : "";

  const content = (
    <>
      <p className={errClass}>{error?.data?.message}</p>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        onFinish={onSaveUserClicked}
      >
        <div className="form__title-row">
          <h2>New User</h2>
          <div className="form__action-buttons">
            <Button
              type="primary"
              title="Save"
              htmlType="submit"
              disabled={!canSave}
            >
              Submit
            </Button>
          </div>
        </div>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please input your full name!" }]}
          className={`form__input ${validNameClass}`}
          value={name}
          onChange={onNameChanged}
        >
          <Input placeholder="Full Name" />
        </Form.Item>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
          className={`form__input ${validUserClass}`}
          value={username}
          onChange={onUsernameChanged}
        >
          <Input placeholder="[3-20 letters]" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
          className={`form__input ${validPwdClass}`}
          value={password}
          onChange={onPasswordChanged}
        >
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={onPasswordChanged}
          />
        </Form.Item>
        <Form.Item
          name="roles"
          label="Roles"
          rules={[{ required: true, message: "Please select roles!" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select roles"
            style={{ width: "100%" }}
            className={`form__select ${validRolesClass}`}
            value={roles}
            options={options}
            onChange={onRolesChanged}
          ></Select>
        </Form.Item>
      </Form>
    </>
  );

  return content;
};
export default NewUserForm;
