import { useEffect } from "react";
import {
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} from "./campaignsApiSlice";
import { useNavigate } from "react-router-dom";
import { Row, Col, Divider, Form, Input, Button, Select } from "antd";

//Get Campaign Enums
import {
  SocialMediaType,
  PostType,
  CampaignStatuses,
} from "../../config/enums";

// URL validation rule
const urlValidationRule = {
  type: "url",
  message: "Please enter a valid URL!",
};

const EditCampaignForm = ({ campaign, users }) => {
  const [updateCampaign, { isLoading, isSuccess, isError, error }] =
    useUpdateCampaignMutation();

  const [
    deleteCampaign,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteCampaignMutation();

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      form.resetFields();
      navigate("/dash/campaigns");
    }
  }, [isSuccess, isDelSuccess, navigate, form]);

  const onFinish = async (values) => {
    const { user, status, title, social_media, post_type, post_url } = values;
    console.log("Payload to send:", {
      id: campaign.id,
      user,
      status,
      title,
      social_media,
      post_type,
      post_url,
    }); // Add this line for debugging

    try {
      await updateCampaign({
        id: campaign.id,
        user,
        status,
        title,
        social_media,
        post_type,
        post_url,
      });
      console.log("Updated campaign successfully");
    } catch (err) {
      console.error("Failed to update campaign:", err);
    }
  };

  const onDeleteCampaign = async () => {
    await deleteCampaign({ id: campaign.id });
  };

  const created = new Date(campaign.createdAt).toLocaleString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
  const updated = new Date(campaign.updatedAt).toLocaleString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const socialMediaTypeOptions = Object.values(SocialMediaType).map(
    (social_media_option) => ({
      value: social_media_option,
      label: social_media_option,
    })
  );

  const postTypeOptions = Object.values(PostType).map(
    (campaign_type_option) => ({
      value: campaign_type_option,
      label: campaign_type_option,
    })
  );

  const campaignStatusesOptions = Object.values(CampaignStatuses).map(
    (campaign_status_option) => ({
      value: campaign_status_option,
      label: campaign_status_option,
    })
  );

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
          user: campaign.user,
          status: campaign.status,
          title: campaign.title,
          social_media: campaign.social_media,
          post_type: campaign.post_type,
          post_url: campaign.post_url,
        }}
      >
        <div className="form__title-row">
          <h2>Edit Campaign - {campaign.title}</h2>
        </div>
        <Row>
          <Col span={12}>
            <p className="form__created">
              Sales Person:
              <br />
              {campaign.fullname}
            </p>
          </Col>
          <Col span={12}>
            <p className="form__created">
              Date Created:
              <br />
              {created}
            </p>
          </Col>
        </Row>
        <Divider />
        <Form.Item
          name="user"
          hidden
        >
          <Input
            type="hidden"
            readOnly
            disabled
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[
            { required: true, message: "Please select a campaign status!" },
          ]}
        >
          <Select
            placeholder="Select campaign status"
            style={{ width: "100%" }}
            options={campaignStatusesOptions}
          ></Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please input campaign title!" }]}
        >
          <Input placeholder="Campaign Title" />
        </Form.Item>

        <Form.Item
          name="social_media"
          label="Social Media"
          rules={[{ required: true, message: "Please select a social media!" }]}
        >
          <Select
            placeholder="Select social media"
            style={{ width: "100%" }}
            options={socialMediaTypeOptions}
          ></Select>
        </Form.Item>

        <Form.Item
          name="post_type"
          label="Post Type"
          rules={[{ required: true, message: "Please select a post type!" }]}
        >
          <Select
            placeholder="Select post type"
            style={{ width: "100%" }}
            options={postTypeOptions}
          ></Select>
        </Form.Item>

        <Form.Item
          name="post_url"
          label="Post URL"
          rules={[
            { required: true, message: "URL is required!" },
            urlValidationRule,
          ]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>
        <div className="form__divider"></div>
        <Row>
          <Col span={12}>
            <p className="form__updated">
              Date Updated:
              <br />
              {updated}
            </p>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              title="Save"
              htmlType="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Update Campaign
            </Button>
          </Col>
        </Row>
        <div className="form__action-buttons"></div>
      </Form>
    </>
  );

  return content;
};

export default EditCampaignForm;
