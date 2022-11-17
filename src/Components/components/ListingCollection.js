import React, { memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ListingCard from './ListingCard';
import { init, fetchListings } from '../../GlobalState/marketplaceSlice';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Spinner } from 'react-bootstrap';
import { SortOption } from '../Models/sort-option.model';

import { FilterOption } from '../Models/filter-option.model';
import HiddenCard from './HiddenCard';
import {isMetapixelsCollection} from "../../utils";

const ListingCollection = ({ showLoadMore = true, collectionId = null, sellerId = null, cacheName = null }) => {
  const dispatch = useDispatch();
  const listings = useSelector((state) => state.marketplace.listings);

  const canLoadMore = useSelector((state) => {
    return state.marketplace.curPage === 0 || state.marketplace.curPage < state.marketplace.totalPages;
  });
  const isFetching = useSelector((state) => state.marketplace.loading);

  const marketplace = useSelector((state) => {
    return state.marketplace;
  });

  useEffect(() => {
    if (collectionId) {
      const sortOption = new SortOption();
      sortOption.key = 'listingId';
      sortOption.direction = 'desc';
      sortOption.label = 'By Id';

      const filterOption = new FilterOption();
      filterOption.type = 'collection';
      filterOption.address = collectionId;
      filterOption.name = 'By Collection';

      dispatch(init(sortOption, filterOption));
      dispatch(fetchListings());
      return;
    }

    if (sellerId) {
      const sortOption = new SortOption();
      sortOption.key = 'listingId';
      sortOption.direction = 'desc';
      sortOption.label = 'By Id';

      const filterOption = new FilterOption();
      filterOption.type = 'seller';
      filterOption.address = sellerId;
      filterOption.name = 'By Seller';

      dispatch(init(sortOption, filterOption));
      dispatch(fetchListings());
      return;
    }

    const filterOption = marketplace.cachedFilter[cacheName] ?? FilterOption.default();
    const sortOption = marketplace.cachedSort[cacheName] ?? SortOption.default();

    dispatch(init(sortOption, filterOption));
    dispatch(fetchListings());
  }, [dispatch]);

  const loadMore = () => {
    if (!isFetching) {
      dispatch(fetchListings());
    }
  };

  if (showLoadMore) {
    return (
      <InfiniteScroll
        dataLength={listings.length}
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
        endMessage={() => {
          if (listings.length) {
            return (
              <div className="row mt-4">
                <div className="col-lg-12 text-center">
                  <span>Nothing to see here...</span>
                </div>
              </div>
            );
          }
        }}
      >
        <div className="card-group">
          {listings &&
            listings.map((listing, index) => (
              <div key={index} className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4 px-2">
                {listing.special ? <HiddenCard /> : <ListingCard listing={listing} imgClass="marketplace" watermark={isMetapixelsCollection(listing.nftAddress) ? "/img/collections/metapixels/avatar.png" : null} />}
              </div>
            ))}
        </div>
      </InfiniteScroll>
    );
  } else {
    return (
      <div className="row">
        <div className="card-group">
          {listings &&
            listings.map((listing, index) => (
              <div key={index} className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4 px-2">
                {listing.special ? <HiddenCard /> : <ListingCard listing={listing} imgClass="marketplace" watermark={isMetapixelsCollection(listing.nftAddress) ? "/img/collections/metapixels/avatar.png" : null} />}
              </div>
            ))}
        </div>
        {showLoadMore && canLoadMore && (
          <div className="col-lg-12">
            <div className="spacer-single" />
            <span onClick={loadMore} className="btn-main lead m-auto">
              Load More
            </span>
          </div>
        )}
      </div>
    );
  }
};

export default memo(ListingCollection);
