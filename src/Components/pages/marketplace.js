import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import ListingCollection from '../components/ListingCollection';
import Footer from '../components/Footer';
import TopFilterBar from '../components/TopFilterBar';
import { filterListings, getMarketData, sortListings } from '../../GlobalState/marketplaceSlice';
import { siPrefixedNumber } from '../../utils';
import { sortOptions } from '../components/constants/sort-options';
import { SortOption } from '../Models/sort-option.model';
import { marketPlaceCollectionFilterOptions } from '../components/constants/filter-options';
import { FilterOption } from '../Models/filter-option.model';

const Marketplace = () => {
  const cacheName = 'marketplace';

  const dispatch = useDispatch();

  const marketplace = useSelector((state) => {
    return state.marketplace;
  });

  const marketData = useSelector((state) => {
    return state.marketplace.marketData;
  });

  // const [openMenu, setOpenMenu] = React.useState(0);
  const handleBtnClick = (index) => (element) => {
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.parentElement.classList.add('active');

    // setOpenMenu(index);
  };

  useEffect(() => {
    dispatch(getMarketData());
    // eslint-disable-next-line
  }, []);

  const selectDefaultFilterValue = marketplace.cachedFilter[cacheName] ?? FilterOption.default();
  const selectDefaultSortValue = marketplace.cachedSort[cacheName] ?? SortOption.default();

  const selectFilterOptions = marketPlaceCollectionFilterOptions;
  const selectSortOptions = useSelector((state) => {
    if (state.marketplace.hasRank) {
      return sortOptions;
    }

    return sortOptions.filter((s) => s.key !== 'rank');
  });

  const onFilterChange = useCallback(
    (filterOption) => {
      dispatch(filterListings(filterOption, cacheName));
    },
    [dispatch]
  );

  const onSortChange = useCallback(
    (sortOption) => {
      dispatch(sortListings(sortOption, cacheName));
    },
    [dispatch]
  );

  return (
    <div>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Marketplace</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          {marketData && (
            <div className="d-item col-lg-6 col-sm-10 mb-4 mx-auto">
              <a className="nft_attr">
                <div className="row">
                  <div className="col-4">
                    <h5>Volume</h5>
                    <h4>{siPrefixedNumber(Number(marketData.totalVolume).toFixed(0))} CRO</h4>
                  </div>
                  <div className="col-4">
                    <h5>Sales</h5>
                    <h4>{siPrefixedNumber(Number(marketData.totalSales).toFixed(0))}</h4>
                  </div>
                  <div className="col-4">
                    <h5>Active</h5>
                    <h4>{siPrefixedNumber(marketData.totalActive)}</h4>
                  </div>
                </div>
              </a>
            </div>
          )}
        </div>
        <div className="row">
          <div className="col-lg-12">
            <TopFilterBar
              showFilter={true}
              showSort={true}
              sortOptions={[SortOption.default(), ...selectSortOptions]}
              filterOptions={[FilterOption.default(), ...selectFilterOptions]}
              defaultSortValue={selectDefaultSortValue}
              defaultFilterValue={selectDefaultFilterValue}
              filterPlaceHolder="Filter Collection..."
              sortPlaceHolder="Sort Listings..."
              onFilterChange={onFilterChange}
              onSortChange={onSortChange}
            />
          </div>
        </div>
        <ListingCollection cacheName="marketplace" />
      </section>

      <Footer />
    </div>
  );
};
export default Marketplace;
