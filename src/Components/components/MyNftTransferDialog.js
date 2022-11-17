import React, { memo, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { MyNftPageActions } from '../../GlobalState/User';
import {
  Button,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';

const ListDialogStepEnum = {
  WaitingForTransferApproval: 0,
  EnteringPrice: 1,
  ConfirmListing: 2,
};

Object.freeze(ListDialogStepEnum);

const mapStateToProps = (state) => ({
  walletAddress: state.user.address,
  myNftPageTransferDialog: state.user.myNftPageTransferDialog,
});

const MyNftTransferDialog = ({ walletAddress, myNftPageTransferDialog }) => {
  const dispatch = useDispatch();

  /// TRANSFER------------------

  const [transferAddress, setTransferAddress] = useState(null);

  useEffect(() => {
    if (!myNftPageTransferDialog) {
      setTransferAddress(null);
    }
  }, [myNftPageTransferDialog]);

  const onTransferDialogAddressValueChange = (inputEvent) => {
    const address = inputEvent.target.value;
    setTransferAddress(address);
  };

  const onTransferDialogConfirm = async () => {
    dispatch(MyNftPageActions.transferDialogConfirm(myNftPageTransferDialog, walletAddress, transferAddress));
  };

  const onTransferDialogCancel = () => {
    dispatch(MyNftPageActions.hideMyNftPageTransferDialog());
  };

  return (
    <>
      {myNftPageTransferDialog ? (
        <Dialog onClose={onTransferDialogCancel} open={!!myNftPageTransferDialog}>
          <DialogContent>
            <DialogTitle>Start Transfer</DialogTitle>
            <Grid container spacing={{ sm: 4 }} columns={2}>
              <Grid item xs={2} md={1} key="1">
                <Container>
                  <CardMedia component="img" src={myNftPageTransferDialog.image} width="150" />
                </Container>
              </Grid>
              <Grid item xs={1} key="2">
                <TextField label="Address" variant="outlined" onChange={onTransferDialogAddressValueChange} />
              </Grid>
            </Grid>

            <DialogActions>
              <Button onClick={onTransferDialogCancel}>Cancel</Button>
              <Button onClick={onTransferDialogConfirm}>OK</Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
};

export default connect(mapStateToProps)(memo(MyNftTransferDialog));
