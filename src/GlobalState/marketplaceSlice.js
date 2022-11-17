import { createSlice } from '@reduxjs/toolkit';
import { sortAndFetchListings, getCollectionMetadata, getMarketMetadata } from '../core/api';
import { SortOption } from '../Components/Models/sort-option.model';
import { FilterOption } from '../Components/Models/filter-option.model';

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    loading: false,
    error: false,
    listings: [],
    curPage: 0,
    curFilter: FilterOption.default(),
    curSort: SortOption.default(),
    totalPages: 0,
    collection: null,
    marketData: null,
    hasRank: false,
    cachedFilter: {},
    cachedSort: {},
  },
  reducers: {
    listingsLoading: (state, action) => {
      state.loading = true;
      state.error = false;
    },
    listingsReceived: (state, action) => {
      state.loading = false;
      state.error = false;
      state.listings.push(...action.payload.listings);
      state.curPage = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.hasRank = action.payload.hasRank;
    },
    clearSet: (state, action) => {
      const hardClear = action.payload || false;

      state.listings = [];
      state.curPage = 0;
      state.totalPages = 0;
      state.curFilter = FilterOption.default();
      state.curSort = SortOption.default();

      if (hardClear) {
        state.cachedFilter = {};
        state.cachedSort = {};
      }
    },
    onFilter: (state, action) => {
      const { cacheName, option } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.curPage = 0;
      state.curFilter = option;

      if (cacheName) {
        state.cachedFilter[cacheName] = option;
      }
    },
    onSort: (state, action) => {
      const { cacheName, option } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.curPage = 0;
      state.curSort = option;

      if (cacheName) {
        state.cachedSort[cacheName] = option;
      }
    },
    onCollectionDataLoaded: (state, action) => {
      state.collection = action.payload.collection;
    },
    onMarketDataLoaded(state, action) {
      state.marketData = action.payload.marketdata;
    },
  },
  // extraReducers: (builder) => {
  //     builder.addCase(getListings.fulfilled, (state, action) => {
  //         state.listings = action.payload;
  //     })
  // }
});

export const {
  listingsLoading,
  listingsReceived,
  onFilter,
  onSort,
  clearSet,
  onCollectionDataLoaded,
  onRankingsLoaded,
  onMarketDataLoaded,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;

export const init = (sortOption, filterOption) => async (dispatch, getState) => {
  dispatch(clearSet(false));

  if (sortOption && sortOption instanceof SortOption) {
    dispatch(onSort({ option: sortOption }));
  }

  if (filterOption && filterOption instanceof FilterOption) {
    dispatch(onFilter({ option: filterOption }));
  }
};

export const fetchListings = () => async (dispatch, getState) => {
  const state = getState();

  dispatch(listingsLoading());
  const { response, cancelled } = await sortAndFetchListings(
    state.marketplace.curPage + 1,
    state.marketplace.curSort,
    state.marketplace.curFilter
  );

  if (!cancelled) {
    response.hasRank = response.listings.length > 0 && typeof response.listings[0].nft.rank !== 'undefined';
    dispatch(listingsReceived(response));
  }
};

export const filterListings = (filterOption, cacheName) => async (dispatch) => {
  dispatch(onFilter({ option: filterOption, cacheName }));
  dispatch(fetchListings());
};

export const sortListings = (sortOption, cacheName) => async (dispatch) => {
  dispatch(onSort({ option: sortOption, cacheName }));
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
