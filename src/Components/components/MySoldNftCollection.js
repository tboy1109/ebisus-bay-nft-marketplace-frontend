import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearMySales, fetchSales } from '../../GlobalState/User';
import { Spinner } from 'react-bootstrap';
import { getAnalytics, logEvent } from '@firebase/analytics';
import SoldNftCard from './SoldNftCard';
import InvalidListingsPopup from './InvalidListingsPopup';
import InfiniteScroll from 'react-infinite-scroll-component';
// import HiddenCard from './HiddenCard';
// import ListingCard from './ListingCard';
// import { fetchListings } from '../../GlobalState/marketplaceSlice';

const MySoldNftCollection = ({ walletAddress = null }) => {
  const dispatch = useDispatch();
  const [width, setWidth] = useState(0);
  const isLoading = useSelector((state) => state.user.mySoldNftsFetching);
  const mySoldNfts = useSelector((state) => state.user.mySoldNfts);
  const canLoadMore = useSelector((state) => {
    return state.user.mySoldNftsCurPage === 0 || state.user.mySoldNftsCurPage < state.user.mySoldNftsTotalPages;
  });

  const onImgLoad = ({ target: img }) => {
    let currentWidth = width;
    if (currentWidth < img.offsetWidth) {
      setWidth(img.offsetWidth);
    }
  };

  useEffect(() => {
    dispatch(clearMySales());
    dispatch(fetchSales(walletAddress));
  }, [walletAddress]);

  useEffect(() => {
    logEvent(getAnalytics(), 'screen_view', {
      firebase_screen: 'my_sales',
    });
  }, []);

  const loadMore = () => {
    if (!isLoading) {
      dispatch(fetchSales(walletAddress));
    }
  };

  return (
    <>
      <InvalidListingsPopup navigateTo={true} />
      <InfiniteScroll
        dataLength={mySoldNfts.length}
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
        <div className="row">
          {mySoldNfts &&
            mySoldNfts.map((nft, index) => <SoldNftCard nft={nft} index={index} onImgLoad={onImgLoad} width={width} />)}
        </div>
      </InfiniteScroll>

      {!isLoading && mySoldNfts.length === 0 && (
        <div className="row mt-4">
          <div className="col-lg-12 text-center">
            <span>Nothing to see here...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(MySoldNftCollection);
