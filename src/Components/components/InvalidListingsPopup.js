import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { /* fetchUnfilteredListings, */ MyListingsCollectionPageActions } from '../../GlobalState/User';

const InvalidListingsPopup = (props) => {
  const [openInvalidListingsAlertDialog, setOpenInvalidListingsAlertDialog] = useState(false);
  const myListings = useSelector((state) => state.user.myUnfilteredListings);
  const dispatch = useDispatch();
  const [userAcknowledgedWarning, setUserAcknowledgedWarning] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (!userAcknowledgedWarning) {
      setOpenInvalidListingsAlertDialog(myListings.some((value) => !value.valid));
    }
  }, [myListings]);

  const invalidListingsWarningAcknowledged = () => {
    setUserAcknowledgedWarning(true);
    setOpenInvalidListingsAlertDialog(false);
  };

  const navigateTo = (link) => {
    history.push(link);
  };

  return (
    <>
      <Modal show={openInvalidListingsAlertDialog} size="lg" onHide={() => invalidListingsWarningAcknowledged()}>
        <Modal.Header>
          <Modal.Title>Warning! Invalid Listings Detected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Some of your current listings are invalid.</strong> This can happen when a listed NFT was not
            delisted from the marketplace before being staked, transferred, or approval being revoked. This can cause
            NFTs to be sold significantly under floor price once the NFT returns to your wallet.
          </p>
          <h4>Option 1 (Recommended):</h4>
          <p className="mb-4">
            Click <strong>Show Invalid Listings</strong> below and cancel any invalid listings <strong>before</strong>{' '}
            those NFTs return to your wallet or approval has been granted.
          </p>
          <h4>Option 2 (AT YOUR OWN RISK, lower gas fees):</h4>
          <p>
            Either cancel or update the price of the NFT as soon as it is in your wallet. This is cheaper but must be
            done as soon as possible to avoid users from buying your listing before it can be cancelled or updated.
          </p>

          <div className="alert alert-warning text-center" role="alert">
            <strong>
              Please note: No refunds will be given for sales at older prices. It is your own responsibility to cancel
              listings for NFTs that you stake, transfer or revoke approval.
            </strong>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="row justify-content-center">
            <button
              className="btn-main inline white mb-2 mb-sm-0"
              style={{ width: 'auto' }}
              onClick={() => invalidListingsWarningAcknowledged()}
            >
              I Understand
            </button>
            <button
              className="btn-main inline"
              style={{ width: 'auto' }}
              onClick={() => {
                invalidListingsWarningAcknowledged();
                dispatch(MyListingsCollectionPageActions.setInvalidOnly(true));
                if (props.navigateTo) {
                  navigateTo(`/wallet/listings`);
                }
              }}
            >
              Show Invalid Listings
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default memo(InvalidListingsPopup);
