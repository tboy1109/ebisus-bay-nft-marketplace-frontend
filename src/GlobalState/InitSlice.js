import { createSlice } from '@reduxjs/toolkit';
import { connectAccount, onLogout } from './User';

const appInitializeState = createSlice({
  name: 'appInitialize',
  initialState: {
    initStarted: false,
    publicInitFinished: false,
    authInitFinished: false,
  },
  reducers: {
    appInitStarted(state, action) {
      state.initStarted = true;
    },
    publicInitFinished(state, action) {
      state.publicInitFinished = true;
    },
    appAuthInitFinished(state, action) {
      state.authInitFinished = true;
    },
  },
});

export const appInitializeStateReducer = appInitializeState.reducer;

/**
 * Runs once to initialize application.
 */

export const appInitStarted = () => async (dispatch) => {
  dispatch(appInitializeState.actions.appInitStarted());
};

export const appAuthInitFinished = () => async (dispatch) => {
  dispatch(appInitializeState.actions.appAuthInitFinished());
};

export const publicInitFinished = () => async (dispatch) => {
  dispatch(appInitializeState.actions.publicInitFinished());
};

export const appInitializer = () => async (dispatch) => {
  dispatch(appInitStarted());

  //  If public routes have initializations then check should be added to Router file to wait for public initialization
  dispatch(publicInitFinished());

  const isConnectSupported =
    localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER') ||
    window.ethereum ||
    localStorage.getItem('DeFiLink_session_storage_extension') ||
    window.navigator.userAgent.includes("Crypto.com DeFiWallet");

  if (!isConnectSupported) {
    dispatch(appAuthInitFinished());
    return;
  }

  const web3ModalWillShowUp = !localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER');

  if (web3ModalWillShowUp) {
    //  Web3Modal will show up. Let the Router redirect the user to main page.
    dispatch(appAuthInitFinished());
  }

  dispatch(connectAccount(true));
};
