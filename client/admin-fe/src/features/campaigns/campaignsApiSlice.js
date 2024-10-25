import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const campaignsAdapter = createEntityAdapter({});

const initialState = campaignsAdapter.getInitialState();

export const campaignsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query({
      query: () => ({
        url: "/campaigns",
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError;
        },
      }),
      transformResponse: (responseData) => {
        const loadedCampaigns = responseData.map((campaign) => {
          campaign.id = campaign._id;
          return campaign;
        });
        return campaignsAdapter.setAll(initialState, loadedCampaigns);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Campaign", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Campaign", id })),
          ];
        } else return [{ type: "Campaign", id: "LIST" }];
      },
    }),
    addNewCampaign: builder.mutation({
      query: (initialCampaign) => ({
        url: "/campaigns",
        method: "POST",
        body: {
          ...initialCampaign,
        },
      }),
      invalidatesTags: [{ type: "Campaign", id: "LIST" }],
    }),
    updateCampaign: builder.mutation({
      query: (initialCampaign) => ({
        url: "/campaigns",
        method: "PATCH",
        body: {
          ...initialCampaign,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Campaign", id: arg.id },
      ],
    }),
    deleteCampaign: builder.mutation({
      query: ({ id, salesPerson }) => ({
        url: `/campaigns`,
        method: "DELETE",
        body: { id, salesPerson },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Campaign", id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useAddNewCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} = campaignsApiSlice;

// returns the query result object
export const selectCampaignsResult =
  campaignsApiSlice.endpoints.getCampaigns.select();

// creates memoized selector
const selectCampaignsData = createSelector(
  selectCampaignsResult,
  (campaignsResult) => campaignsResult.data // normalized state object with ids & entities
);

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllCampaigns,
  selectById: selectCampaignById,
  selectIds: selectCampaignIds,
  // Pass in a selector that returns the campaigns slice of state
} = campaignsAdapter.getSelectors(
  (state) => selectCampaignsData(state) ?? initialState
);
