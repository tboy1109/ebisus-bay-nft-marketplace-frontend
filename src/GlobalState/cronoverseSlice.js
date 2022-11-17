import { async } from '@firebase/util';
import { createSlice } from '@reduxjs/toolkit';
import { Contract, ethers } from 'ethers';
import config from '../Assets/networks/rpc_config.json';
// import Cronies from '../Contracts/CronosToken.json';
import cronoverseContract from '../Contracts/Cronoverse.json'

const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
const readCronoverse = new Contract(config.cronoverse_contract, cronoverseContract.abi, readProvider);

const cronoverSlice = createSlice({
  name: 'cronoverse',
  initialState: {
    mintedIds: [],
    mintCost: []
  },
  reducers: {
    // croniesReceived(state, action) {
    //   state.count = action.payload.count;
    //   state.fetching = false;
    // },
    getMintedIds(state, action) {
      const { mintedIds, mintCost } = action.payload
      state.mintedIds = mintedIds
      state.mintCost = mintCost
    },
  },
});
export const { getMintedIds } = cronoverSlice.actions;

export default cronoverSlice.reducer

export const fetchMintData = () => async (dispatch) => {
    const mintedIds = await readCronoverse.getMintedIds()
    
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const mintCost = await readCronoverse.mintCost(accounts[0])

    dispatch(getMintedIds({mintedIds, mintCost}))
}
// const { croniesReceived } = cronieSlice.actions;
// export const cronies = cronieSlice.reducer;

// export const fetchCronieInfo = () => async (dispatch) => {
//   const c = await readCronies.totalSupply();
//   dispatch(
//     croniesReceived({
//       count: c.toNumber(),
//     })
//   );
// };
