import { createSlice } from '@reduxjs/toolkit';
import { Contract, ethers } from 'ethers';
import config from '../Assets/networks/rpc_config.json';
import Cronies from '../Contracts/CronosToken.json';

const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
const readCronies = new Contract(config.cronie_contract, Cronies.abi, readProvider);

const cronieSlice = createSlice({
  name: 'cronies',
  initialState: {
    price: '100',
    maxMint: '5',
    discount: '0',
    count: 'Fetching...',
    max: 'Open until 1 millionth validated block',
    fetching: true,
  },
  reducers: {
    croniesReceived(state, action) {
      state.count = action.payload.count;
      state.fetching = false;
    },
  },
});

const { croniesReceived } = cronieSlice.actions;
export const cronies = cronieSlice.reducer;

export const fetchCronieInfo = () => async (dispatch) => {
  const c = await readCronies.totalSupply();
  dispatch(
    croniesReceived({
      count: c.toNumber(),
    })
  );
};
