import React from 'react';
import { useDispatch } from 'react-redux';
import { chainConnect, onLogout } from '../../GlobalState/User';
import config from '../../Assets/networks/rpc_config.json';
// import MetaMaskOnboarding from '@metamask/onboarding';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';

// const MetamaskOnboard = () => {
//     const dispatch = useDispatch();
//     const [open, setOpen] = React.useState(true)
//     const handleClose = () => {
//         window.location.reload();
//     };
//     const onboardNow = () => {
//         const onboarding = new MetaMaskOnboarding();
//         onboarding.startOnboarding();
//         // const onBoard = () => {
//         //     onboarding.startOnboarding();
//         // }
//         // dispatch(onboarding.startOnboarding());
//     };
// };

export const SwitchChain = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(true);
  const handleClose = () => {
    dispatch(onLogout());
    window.location.reload();
  };
  const connectNow = () => {
    dispatch(chainConnect());
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogContent>
        <DialogContentText>You need to connect to the {config.name} block chain before continuing.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={connectNow}>Connect</Button>
      </DialogActions>
    </Dialog>
  );
};
