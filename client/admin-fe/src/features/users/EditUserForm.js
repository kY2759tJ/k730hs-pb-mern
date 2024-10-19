import { useEffect } from "react";
import { useUpdateUserMutation, useDeleteUserMutation } from "./usersApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { ROLES } from "../../config/enums";
import { Form, Input, Checkbox, Select, Button, Tooltip } from "antd";

const NAME_REGEX = /^[a-zA-Z]+([ '-][a-zA-Z]+)*$/;
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

const EditUserForm = ({ user }) => {
  const [updateUser, { isLoading, isSuccess, isError, error }] =
    useUpdateUserMutation();

  const [
    deleteUser,
    { isSuccess: isDelSuccess, isError: isDelError, error: delError },
  ] = useDeleteUserMutation();

  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      form.resetFields();
      navigate("/dash/users");
    }
  }, [isSuccess, isDelSuccess, navigate, form]);

  const onFinish = async (values) => {
    const { name, username, password, roles, active } = values;
    const payload = password
      ? { id: user.id, name, username, password, roles, active }
      : { id: user.id, name, username, roles, active };
    await updateUser(payload);
  };

  const onDeleteUser = async () => {
    await deleteUser({ id: user.id });
  };

  const options = Object.values(ROLES).map((role) => ({
    label: role,
    value: role,
  }));

  const errorMessage = error?.data?.message || delError?.data?.message || "";
  const showMessage = (isError || isDelError) && errorMessage;

  const content = (
    <>
      {showMessage && <p className="errmsg">{errorMessage}</p>}
      <div className="form__title-row">
        <h2>Edit User</h2>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name: user.name,
          username: user.username,
          roles: user.roles,
          active: user.active,
        }}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          label="Username"
          name="username"
        >
          <Tooltip title="Username cannot be changed">
            <Input
              value={user.username}
              readOnly
              disabled
            />
          </Tooltip>
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: "Please enter a full name!" },
            { pattern: NAME_REGEX, message: "Name must be 3-20 letters." },
          ]}
        >
          <Input
            placeholder="[3-20 letters]"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              pattern: PWD_REGEX,
              message: "Password must be 4-12 valid characters.",
            },
          ]}
        >
          <Input.Password placeholder="Leave empty to keep unchanged" />
        </Form.Item>

        <Form.Item
          name="active"
          valuePropName="checked"
        >
          <Checkbox>Active</Checkbox>
        </Form.Item>

        <Form.Item
          label="Assigned Roles"
          name="roles"
          rules={[
            { required: true, message: "Please select at least one role." },
          ]}
        >
          <Select
            mode="multiple"
            options={options}
            placeholder="Select roles"
            allowClear
          />
        </Form.Item>

        <div className="form__action-buttons">
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            icon={<FontAwesomeIcon icon={faSave} />}
            style={{ marginRight: "10px" }}
          >
            Save
          </Button>
          <Button
            danger
            onClick={onDeleteUser}
            icon={<FontAwesomeIcon icon={faTrashCan} />}
          >
            Delete
          </Button>
        </div>
      </Form>
    </>
  );

  return content;
};
export default EditUserForm;
