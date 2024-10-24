import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const commissionPayoutsAdapter = createEntityAdapter({});

const initialState = commissionPayoutsAdapter.getInitialState();

export const commissionPayoutsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommissionPayouts: builder.query({
      query: ({ yearMonth, salesPerson }) => {
        // Construct the URL conditionally based on the values of yearMonth and salesPerson
        let url = "/commissionPayouts"; // Default URL

        if (yearMonth && salesPerson) {
          url = `commissionPayouts/details/?yearMonth=${yearMonth}&salesPerson=${salesPerson}`;
        } else if (yearMonth && !salesPerson) {
          url = `/commissionPayouts?yearMonth=${yearMonth}`;
        }

        return { url };
      },
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedCommissionPayouts = responseData.map((commissionPayout) => {
          commissionPayout.id = commissionPayout._id;
          return commissionPayout;
        });
        return commissionPayoutsAdapter.setAll(
          initialState,
          loadedCommissionPayouts
        );
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "CommissionPayout", id: "LIST" },
            ...result.ids.map((id) => ({ type: "CommissionPayout", id })),
          ];
        } else return [{ type: "CommissionPayout", id: "LIST" }];
      },
    }),
    getCommissionPayoutsCampaigns: builder.query({
      query: ({ yearMonth, salesPerson }) => {
        // Construct the URL conditionally based on the values of yearMonth and salesPerson
        let url = "/commissionPayouts"; // Default URL

        if (yearMonth && salesPerson) {
          url = `commissionPayouts/details/?yearMonth=${yearMonth}&salesPerson=${salesPerson}`;
        } else if (yearMonth && !salesPerson) {
          url = `/commissionPayouts?yearMonth=${yearMonth}`;
        }

        return { url };
      },
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedCommissionPayouts = responseData.map((commissionPayout) => {
          return commissionPayout;
        });
        return commissionPayoutsAdapter.setAll(
          initialState,
          loadedCommissionPayouts
        );
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "CommissionPayout", id: "LIST" },
            ...result.ids.map((id) => ({ type: "CommissionPayout", id })),
          ];
        } else return [{ type: "CommissionPayout", id: "LIST" }];
      },
    }),
    addNewCommissionPayout: builder.mutation({
      query: (initialCommissionPayout) => ({
        url: "/commissionPayouts",
        method: "POST",
        body: {
          ...initialCommissionPayout,
        },
      }),
      invalidatesTags: [{ type: "CommissionPayout", id: "LIST" }],
    }),
    updateCommissionPayout: builder.mutation({
      query: (initialCommissionPayout) => ({
        url: "/commissionPayouts",
        method: "PATCH",
        body: {
          ...initialCommissionPayout,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CommissionPayout", id: arg.id },
      ],
    }),
    deleteCommissionPayout: builder.mutation({
      query: ({ id }) => ({
        url: `/commissionPayouts`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CommissionPayout", id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetCommissionPayoutsQuery,
  useAddNewCommissionPayoutMutation,
  useUpdateCommissionPayoutMutation,
  useDeleteCommissionPayoutMutation,
  useGetCommissionPayoutsCampaignsQuery,
} = commissionPayoutsApiSlice;

// returns the query result object
export const selectCommissionPayoutsResult =
  commissionPayoutsApiSlice.endpoints.getCommissionPayouts.select();

// creates memoized selector
const selectCommissionPayoutsData = createSelector(
  selectCommissionPayoutsResult,
  (commissionPayoutsResult) => commissionPayoutsResult.data // normalized state object with ids & entities
);

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllCommissionPayouts,
  selectById: selectCommissionPayoutById,
  selectIds: selectcommissionPayoutIds,
  // Pass in a selector that returns the commissionPayouts slice of state
} = commissionPayoutsAdapter.getSelectors(
  (state) => selectCommissionPayoutsData(state) ?? initialState
);
