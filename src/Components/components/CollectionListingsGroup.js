import React, { memo } from 'react';
import ListingCard from './ListingCard';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Spinner } from 'react-bootstrap';

const CollectionListingsGroup = ({ showLoadMore = true, listings = [], canLoadMore = false, loadMore }) => {
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
                <ListingCard listing={listing} imgClass="collection" />
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
                <ListingCard listing={listing} imgClass="collection" />
              </div>
            ))}
        </div>
        {showLoadMore && canLoadMore && (
          <div className="col-lg-12">
            <div className="spacer-single"></div>
            <span onClick={loadMore} className="btn-main lead m-auto">
              Load More
            </span>
          </div>
        )}
      </div>
    );
  }
};

export default memo(CollectionListingsGroup);
