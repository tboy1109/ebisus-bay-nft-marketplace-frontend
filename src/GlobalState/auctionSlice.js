import { createSlice } from '@reduxjs/toolkit';
import { getAuction, getNft } from '../core/api';
import { Contract, ethers } from 'ethers';
import Auction from '../Contracts/Auction.json';
import config from '../Assets/networks/rpc_config.json';
const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);

const auctionSlice = createSlice({
  name: 'listing',
  initialState: {
    loading: false,
    error: false,
    auction: null,
    nft: null,
    history: [],
    bidHistory: [],
    powertraits: [],
    minBid: null,
  },
  reducers: {
    auctionLoading: (state) => {
      state.loading = true;
    },
    auctionReceived: (state, action) => {
      state.loading = false;
      state.auction = action.payload.listing;
      state.history = action.payload.history ?? [];
      state.bidHistory = action.payload.listing.bidHistory ?? [];
      state.powertraits = action.payload.powertraits ?? [];
      state.minBid = action.payload.minBid;
    },
    auctionUpdated: (state, action) => {
      state.listing = action.payload.listing;
    },
  },
});

export const { auctionLoading, auctionReceived, auctionUpdated } = auctionSlice.actions;

export default auctionSlice.reducer;

export const getAuctionDetails = (auctionId) => async (dispatch) => {
  dispatch(auctionLoading());
  const listing = await getAuction(auctionId);
  const nft = await getNft(listing.nftAddress, listing.nftId, false);
  const history = nft?.listings ?? [];
  const powertraits = nft.nft?.powertraits ?? [];

  let minBid;
  try {
    const readContract = new Contract(config.auction_contract, Auction.abi, readProvider);
    minBid = await readContract.minimumBid(listing.auctionHash);
    minBid = ethers.utils.formatEther(minBid);
  } catch (error) {
    minBid = listing.minimumBid;
    console.log('Failed to retrieve minimum bid. Falling back to api value', listing.auctionId);
  }
  dispatch(auctionReceived({ listing, history, powertraits, minBid }));
};
