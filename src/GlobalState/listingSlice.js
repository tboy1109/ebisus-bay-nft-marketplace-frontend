import { createSlice } from '@reduxjs/toolkit';
import { getListing, getNft } from '../core/api';

const listingSlice = createSlice({
  name: 'listing',
  initialState: {
    loading: false,
    error: false,
    listing: null,
    nft: null,
    history: [],
    powertraits: [],
  },
  reducers: {
    listingLoading: (state) => {
      state.loading = true;
    },
    listingReceived: (state, action) => {
      state.loading = false;
      state.listing = action.payload.listing;
      state.history = action.payload.history ?? [];
      state.powertraits = action.payload.powertraits ?? [];
    },
    listingUpdated: (state, action) => {
      state.listing = action.payload.listing;
    },
  },
});

export const { listingLoading, listingReceived, listingUpdated } = listingSlice.actions;

export default listingSlice.reducer;

export const getListingDetails = (listingId) => async (dispatch) => {
  dispatch(listingLoading());
  let listing = await getListing(listingId);
  const nft = await getNft(listing.nftAddress, listing.nftId);
  if (nft) {
    listing = {...listing, ...{nft: nft.nft}};
  }
  const history = nft?.listings ?? [];
  const powertraits = nft.nft?.powertraits ?? [];
  dispatch(listingReceived({ listing, history, powertraits }));
};
