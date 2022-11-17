import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';

import ListingCollection from '../components/ListingCollection';
import Footer from '../components/Footer';
import TopFilterBar from '../components/TopFilterBar';
import { sortOptions } from '../components/constants/sort-options';
import { SortOption } from '../Models/sort-option.model';
import { sortListings } from '../../GlobalState/marketplaceSlice';
import { shortAddress } from 'src/utils';

const Seller = () => {
  const cacheName = 'sellerPage';

  const dispatch = useDispatch();
  const { address } = useParams();

  const marketplace = useSelector((state) => {
    return state.marketplace;
  });

  const selectDefaultSortValue = marketplace.cachedSort[cacheName] ?? SortOption.default();

  const selectSortOptions = useSelector((state) => {
    if (state.marketplace.hasRank) {
      return sortOptions;
    }

    return sortOptions.filter((s) => s.key !== 'rank');
  });

  const onSortChange = useCallback(
    (sortOption) => {
      dispatch(sortListings(sortOption, cacheName));
    },
    [dispatch]
  );

  return (
    <div>
      <Helmet>
        <title>{shortAddress(address) || 'Seller'} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${shortAddress(address) || 'Seller'} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${shortAddress(address) || 'Seller'} | Ebisu's Bay Marketplace`} />
        <meta property="og:title" content={`${shortAddress(address) || 'Seller'} | Ebisu's Bay Marketplace`} />
        <meta property="og:url" content={`https://app.ebisusbay.com/seller/${address}`} />
        <meta name="twitter:title" content={`${shortAddress(address) || 'Seller'} | Ebisu's Bay Marketplace`} />
      </Helmet>
      <section
        className="jumbotron breadcumb no-bg"
        style={{ backgroundImage: `url(${'/img/background/subheader-blue.webp'})` }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>Marketplace</h1>
                <p>{`${address.substring(0, 4)}...${address.substring(address.length - 3, address.length)}`}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <TopFilterBar
              showFilter={false}
              showSort={true}
              sortPlaceHolder="Sort Listings..."
              sortOptions={[SortOption.default(), ...selectSortOptions]}
              defaultSortValue={selectDefaultSortValue}
              onSortChange={onSortChange}
            />
          </div>
        </div>
        <ListingCollection sellerId={address} />
      </section>

      <Footer />
    </div>
  );
};
export default Seller;
