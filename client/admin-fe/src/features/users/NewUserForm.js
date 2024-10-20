import { useEffect } from "react";
import { useAddNewUserMutation } from "./usersApiSlice";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../../config/enums";
import { Form, Input, Button, Select } from "antd";

const NAME_REGEX = /^[a-zA-Z]+([ '-][a-zA-Z]+)*$/;
const USER_REGEX = /^[A-z]{3,20}$/;
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

const NewUserForm = () => {
  const [addNewUser, { isLoading, isSuccess, isError, error }] =
    useAddNewUserMutation();

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      navigate("/dash/users");
    }
  }, [isSuccess, navigate, form]);

  const onFinish = async (values) => {
    const { fullname, username, password, roles } = values;
    try {
      await addNewUser({ fullname, username, password, roles });
      console.log(values);
      console.log("User added successfully");
    } catch (err) {
      console.error("Failed to add user:", err);
    }
  };

  const options = Object.values(ROLES).map((role) => ({
    value: role,
    label: role,
  }));

  const errClass = isError ? "errmsg" : "offscreen";
  const errContent = error?.data?.message ?? "";

  const content = (
    <>
      <p className={errClass}>{errContent}</p>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        initialValues={{
          roles: ["Salesperson"], // Default roles
        }}
      >
        <div className="form__title-row">
          <h2>New User</h2>
        </div>

        <Form.Item
          name="fullname"
          label="Name"
          rules={[
            { required: true, message: "Please input your full name!" },
            { pattern: NAME_REGEX, message: "Invalid name format!" },
          ]}
        >
          <Input placeholder="Full Name" />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: "Please input your username!" },
            { pattern: USER_REGEX, message: "3-20 letters only" },
          ]}
        >
          <Input placeholder="[3-20 letters]" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please input your password!" },
            { pattern: PWD_REGEX, message: "4-12 valid characters" },
          ]}
        >
          <Input
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item
          name="roles"
          label="Roles"
        >
          <Select
            placeholder="Select roles"
            style={{ width: "100%" }}
            options={options}
          ></Select>
        </Form.Item>

        <div className="form__action-buttons">
          <Button
            type="primary"
            title="Save"
            htmlType="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            Add New User
          </Button>
        </div>
      </Form>
    </>
  );

  return content;
};
export default NewUserForm;
