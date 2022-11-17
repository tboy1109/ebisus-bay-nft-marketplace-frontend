import { createSlice } from '@reduxjs/toolkit';
import { /*sortAndFetchListings, */ getCollectionMetadata, getMarketMetadata, sortAndFetchAuctions } from '../core/api';
import config from '../Assets/networks/rpc_config.json';
export const knownContracts = config.known_contracts;

const auctionsSlice = createSlice({
  name: 'auctions',
  initialState: {
    loading: false,
    error: false,
    auctions: [],
    curPage: 0,
    curFilter: {},
    curSort: {},
    totalPages: 0,
    collection: null,
    marketData: null,
    hasRank: false,
    cachedFilter: {},
    cachedSort: {},
  },
  reducers: {
    auctionsLoading: (state, action) => {
      state.loading = true;
      state.error = false;
    },
    auctionsReceived: (state, action) => {
      state.loading = false;
      state.error = false;
      state.auctions.push(...action.payload.auctions);
      state.curPage = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.hasRank = action.payload.hasRank;
    },
    clearSet: (state, action) => {
      const hardClear = action.payload || false;

      state.auctions = [];
      state.curPage = 0;
      state.totalPages = 0;
      state.curFilter = {};
      state.curSort = {};

      if (hardClear) {
        state.cachedFilter = {};
        state.cachedSort = {};
      }
    },
    onFilter: (state, action) => {
      const { cacheName, ...payload } = action.payload;

      state.auctions = [];
      state.totalPages = 0;
      state.curPage = 0;
      state.curFilter = payload;

      if (cacheName) {
        state.cachedFilter[cacheName] = payload;
      }
    },
    onSort: (state, action) => {
      const { cacheName, ...payload } = action.payload;

      state.auctions = [];
      state.totalPages = 0;
      state.curPage = 0;
      state.curSort = payload;

      if (cacheName) {
        state.cachedSort[cacheName] = payload;
      }
    },
    onCollectionDataLoaded: (state, action) => {
      state.collection = action.payload.collection;
    },
    onMarketDataLoaded(state, action) {
      state.marketData = action.payload.marketdata;
    },
  },
});

export const {
  auctionsLoading,
  auctionsReceived,
  onFilter,
  onSort,
  clearSet,
  onCollectionDataLoaded,
  onRankingsLoaded,
  onMarketDataLoaded,
} = auctionsSlice.actions;

export default auctionsSlice.reducer;

export const init = (sort, filter) => async (dispatch, getState) => {
  dispatch(clearSet(false));

  if (sort) {
    dispatch(
      onSort({
        type: sort.type,
        direction: sort.direction,
      })
    );
  }

  if (filter) {
    dispatch(
      onFilter({
        type: filter.type,
        address: filter.address,
      })
    );
  }
};

export const fetchListings = () => async (dispatch, getState) => {
  const state = getState();

  dispatch(auctionsLoading());
  const response = await sortAndFetchAuctions(
    state.marketplace.curPage + 1,
    state.marketplace.curSort,
    state.marketplace.curFilter.type,
    state.marketplace.curFilter.address
  );
  response.hasRank = response.auctions.length > 0 && typeof response.auctions[0].nft.rank !== 'undefined';

  dispatch(auctionsReceived(response));
};

export const filterListings =
  ({ type, address, label }, cacheName) =>
  async (dispatch) => {
    dispatch(
      onFilter({
        type: type,
        address: address,
        label: label,
        cacheName: cacheName,
      })
    );
    dispatch(fetchListings());
  };

export const sortListings =
  ({ type, direction, label }, cacheName) =>
  async (dispatch) => {
    dispatch(
      onSort({
        type: type,
        direction: direction,
        label: label,
        cacheName: cacheName,
      })
    );
    dispatch(fetchListings());
  };

export const resetListings = () => async (dispatch) => {
  dispatch(clearSet());
  dispatch(fetchListings());
};

export const getCollectionData = (address) => async (dispatch) => {
  try {
    const response = await getCollectionMetadata(address);
    dispatch(
      onCollectionDataLoaded({
        collection: response.collections[0],
      })
    );
  } catch (error) {
    console.log(error);
  }
};

export const getMarketData = () => async (dispatch) => {
  try {
    const response = await getMarketMetadata();
    dispatch(
      onMarketDataLoaded({
        marketdata: response,
      })
    );
  } catch (error) {
    console.log(error);
  }
};
