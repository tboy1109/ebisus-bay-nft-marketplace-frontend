import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  // clearMySales,
  clearMyUnfilteredListings,
  // fetchSales,
  fetchUnfilteredListings,
  MyListingsCollectionPageActions,
} from '../../GlobalState/User';
import { Form, Spinner } from 'react-bootstrap';
import { getAnalytics, logEvent } from '@firebase/analytics';
import MyListingCard from './MyListingCard';
import MyNftListDialog from './MyNftListDialog';
import MyNftCancelDialog from './MyNftCancelDialog';
import InvalidListingsPopup from './InvalidListingsPopup';

import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InfiniteScroll from 'react-infinite-scroll-component';
// import SoldNftCard from './SoldNftCard';

const MyListingsCollection = ({ walletAddress = null }) => {
  const dispatch = useDispatch();
  const [width, setWidth] = useState(0);
  const isLoading = useSelector((state) => state.user.myUnfilteredListingsFetching);
  const myListings = useSelector((state) => state.user.myUnfilteredListings);
  const myUnfilteredListingsInvalidOnly = useSelector((state) => state.user.myUnfilteredListingsInvalidOnly);
  const canLoadMore = useSelector((state) => {
    return (
      state.user.myUnfilteredListingsCurPage === 0 ||
      state.user.myUnfilteredListingsCurPage < state.user.myUnfilteredListingsTotalPages
    );
  });

  const onImgLoad = ({ target: img }) => {
    let currentWidth = width;
    if (currentWidth < img.offsetWidth) {
      setWidth(img.offsetWidth);
    }
  };

  useEffect(() => {
    dispatch(clearMyUnfilteredListings());
    dispatch(fetchUnfilteredListings(walletAddress));
  }, [walletAddress]);

  useEffect(() => {
    logEvent(getAnalytics(), 'screen_view', {
      firebase_screen: 'my_sales',
    });
  }, []);

  const loadMore = () => {
    if (!isLoading) {
      dispatch(fetchUnfilteredListings(walletAddress));
    }
  };

  return (
    <>
      {myListings.some((value) => !value.valid) && (
        <div className="alert alert-danger" role="alert">
          <span>
            {' '}
            <FontAwesomeIcon color="var(--bs-danger)" icon={faExclamationCircle} size={'2x'} />{' '}
          </span>
          <p>
            <strong>Some of your current listings are invalid.</strong> This can happen when a listed NFT was not
            delisted from the marketplace before being staked, transferred, or approval being revoked. This can cause
            NFTs to be sold significantly under floor price once the NFT returns to your wallet.
          </p>
          <h5>Option 1 (Recommended):</h5>
          <p className="mb-4">
            Cancel your listings below <strong>before</strong> those NFTs are returned to your wallet or approval
            granted.
          </p>
          <h5>Option 2 (AT YOUR OWN RISK, lower gas fees):</h5>
          <p>
            Either cancel or update the price of the NFT as soon as it is in your wallet. This is cheaper but must be
            done as soon as possible to avoid users from buying your listing before it can be cancelled or updated.
          </p>
          <p>
            <strong>
              Please note: No refunds will be given for sales at older prices. It is your own responsibility to cancel
              listings for NFTs that you stake, transfer or revoke approval.
            </strong>
          </p>
        </div>
      )}

      <div className="row pt-3">
        <div className="col-12 col-sm-6 col-md-4 m-0 text-nowrap d-flex align-items-center">
          <div className="items_filter">
            <Form.Switch
              className=""
              label={'Only invalid'}
              checked={myUnfilteredListingsInvalidOnly}
              onChange={() =>
                dispatch(MyListingsCollectionPageActions.setInvalidOnly(!myUnfilteredListingsInvalidOnly))
              }
            />
          </div>
        </div>
      </div>
      <div className="row gap-3">
        <InfiniteScroll
          dataLength={myListings.length}
          next={loadMore}
          hasMore={canLoadMore}
          style={{ overflow: 'hidden' }}
          loader={
            <div className="row">
              <div className="col-lg-12 text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            </div>
          }
        >
          <div className="card-group">
            {myListings &&
              myListings
                .filter((x) => x.listed)
                .filter((x) => (myUnfilteredListingsInvalidOnly ? !x.valid : true))
                .map((nft, index) => (
                  <div key={index} className="d-item col-lg-6 col-md-12 mb-4 px-2">
                    <MyListingCard
                      nft={nft}
                      key={index}
                      onImgLoad={onImgLoad}
                      width={width}
                      canCancel={nft.state === 0}
                      canUpdate={nft.state === 0 && nft.isInWallet}
                      onUpdateButtonPressed={() =>
                        dispatch(MyListingsCollectionPageActions.showMyNftPageListDialog(nft))
                      }
                      onCancelButtonPressed={() =>
                        dispatch(MyListingsCollectionPageActions.showMyNftPageCancelDialog(nft))
                      }
                      newTab={true}
                    />
                  </div>
                ))}
          </div>
        </InfiniteScroll>
      </div>
      {!isLoading && myListings.length === 0 && (
        <div className="row mt-4">
          <div className="col-lg-12 text-center">
            <span>Nothing to see here...</span>
          </div>
        </div>
      )}

      <MyNftListDialog />
      <MyNftCancelDialog />
      <InvalidListingsPopup navigateTo={false} />
    </>
  );
};

export default memo(MyListingsCollection);
