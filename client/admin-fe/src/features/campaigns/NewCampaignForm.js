import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddNewCampaignMutation } from "./campaignsApiSlice";
import { useAddNewCommissionPayoutMutation } from "../commissionPayout/commissionPayoutApiSlice";
import { Form, Input, Button, Select, Divider } from "antd";
import useAuth from "../../hooks/useAuth";
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

const getCurrentYearMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    date
  );
  return `${year}-${month}`;
};

const yearMonth = getCurrentYearMonth();

const NewCampaignForm = ({ users }) => {
  const { userId } = useAuth();

  const [addNewCampaign, { isLoading, isSuccess, isError, error }] =
    useAddNewCampaignMutation();

  const [createCommissionPayout] = useAddNewCommissionPayoutMutation(); // Create commission payout mutation

  const [form] = Form.useForm(); // Create a form instance
  const navigate = useNavigate();

  // Simulate getting the user ID from session (e.g., API call or localStorage)
  // useEffect(() => {
  //   const sessionUserId =
  //     localStorage.getItem("userId") || "67123030c0fe0863752fe002"; // Replace with actual logic
  //   console.log(sessionUserId);
  //   setUserId(sessionUserId);
  // }, []);

  //Update the form field once userId is set
  useEffect(() => {
    if (userId) {
      form.setFieldsValue({ user: userId });
    }
  }, [userId, form]);

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      navigate("/dash/campaigns");
    }
  }, [isSuccess, navigate, form]);

  const onFinish = async (values) => {
    const { user, status, title, social_media, post_type, post_url } = values;

    try {
      const result = await addNewCampaign({
        user,
        status,
        title,
        social_media,
        post_type,
        post_url,
      }).unwrap(); // Use unwrap to get the result directly

      console.log("Campaign added successfully:", result);

      // Extract campaign ID from result
      const campaignId = result.id; // Adjust based on your API response structure

      const campaigns = [
        {
          campaign: campaignId,
          orders: [],
        },
      ];

      const newCommissionPayout = {
        salesPerson: user,
        yearMonth: yearMonth,
        campaigns: [
          {
            campaign: campaignId,
            orders: [],
          },
        ],
        totalPayout: 0,
        status: "Pending",
      };

      console.log("newCommissionPayout:", newCommissionPayout);

      // Create commission payout
      const payoutResult = await createCommissionPayout(
        newCommissionPayout
      ).unwrap(); // Example payout
      console.log("Commission payout created successfully:", payoutResult);
    } catch (err) {
      console.error("Failed to add campaign:", err);
    }
  };

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
      >
        <div className="form__title-row">
          <h2>Add New Campaign</h2>
        </div>

        <Divider />

        <Form.Item
          name="user"
          hidden
        >
          <Input type="hidden" />
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

        <div className="form__action-buttons">
          <Button
            type="primary"
            title="Save"
            htmlType="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            Add New Campaign
          </Button>
        </div>
      </Form>
    </>
  );

  return content;
};

export default NewCampaignForm;
