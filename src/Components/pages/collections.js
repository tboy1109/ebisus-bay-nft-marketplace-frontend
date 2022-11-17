import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import Blockies from 'react-blockies';
import { Form, Spinner } from 'react-bootstrap';
// import Select from 'react-select';

import Footer from '../components/Footer';
import { getAllCollections } from '../../GlobalState/collectionsSlice';
// import { searchListings } from '../../GlobalState/collectionSlice';
// import { SortOption } from '../Models/sort-option.model';
import { debounce } from '../../utils';

const GlobalStyles = createGlobalStyle`
  .mobile-view-list-item {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    
    & > span:nth-child(2) {
      font-weight: 300;
    }
  }
  .jumbotron.tint{
    background-color: rgba(0,0,0,0.6);
    background-blend-mode: multiply;
  }
`;

/* const customStyles = {
  option: (base, state) => ({
    ...base,
    background: '#fff',
    color: '#333',
    borderRadius: state.isFocused ? '0' : 0,
    '&:hover': {
      background: '#eee',
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 0,
    marginTop: 0,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  control: (base, state) => ({
    ...base,
    padding: 2,
  }),
}; */

const Collections = () => {
  const mobileListBreakpoint = 1000;

  const dispatch = useDispatch();

  const [tableMobileView, setTableMobileView] = useState(window.innerWidth > mobileListBreakpoint);
  const [searchTerms, setSearchTerms] = useState(null);
  const [filteredCollections, setFilteredCollections] = useState([]);

  const isLoading = useSelector((state) => state.collections.loading);
  const collections = useSelector((state) => {
    return state.collections.collections;
  });
  const sort = useSelector((state) => {
    return state.collections.sort;
  });

  useEffect(() => {
    dispatch(getAllCollections());
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (searchTerms) {
      setFilteredCollections(collections.filter((c) => c.name.toLowerCase().includes(searchTerms.toLowerCase())));
    } else {
      setFilteredCollections(collections);
    }
  }, [collections]);

  const sortCollections = (key) => () => {
    let direction = 'asc';
    if (key === sort.key) {
      direction = sort.direction === 'asc' ? 'desc' : 'asc';
    }
    dispatch(getAllCollections(key, direction));
  };

  const handleSearch = debounce((event) => {
    const { value } = event.target;
    setFilteredCollections(
      collections.filter((c) => {
        return c.name.toLowerCase().includes(value.toLowerCase());
      })
    );
    setSearchTerms(value);
  }, 300);

  //  collection helper pipes
  const collectionTotalVolumeValue = ({ totalVolume }) => `${ethers.utils.commify(Math.round(totalVolume))} CRO`;
  const collectionNumberOfSalesValue = ({ numberOfSales }) => numberOfSales;
  const collectionFloorPriceValue = ({ floorPrice }) => `${ethers.utils.commify(Math.round(floorPrice))} CRO`;
  const collectionAverageSalePriceValue = ({ averageSalePrice }) =>
    `${ethers.utils.commify(Math.round(averageSalePrice))} CRO`;
  const collectionNumberActiveValue = ({ numberActive }) => numberActive;

  return (
    <div>
      <GlobalStyles />
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Collections</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container no-top">
        <div className="row mt-4">
          <div className="col-lg-4 col-md-6">
            <Form.Control type="text" placeholder="Search for Collection" onChange={handleSearch} />
          </div>
        </div>
        {isLoading && (
          <div className="row mt-4">
            <div className="col-lg-12 text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-lg-12">
            <table className="table de-table table-rank" data-mobile-responsive="true">
              <thead>
                <tr>
                  {tableMobileView && <th scope="col">#</th>}
                  <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections('name')}>
                    Collection
                  </th>
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections('totalVolume')}>
                      Volume
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections('numberOfSales')}>
                      Sales
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections('floorPrice')}>
                      Floor Price
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections('averageSalePrice')}>
                      Avg. Price
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections('numberActive')}>
                      Active Listings
                    </th>
                  )}
                </tr>
                <tr />
              </thead>
              <tbody>
                {filteredCollections &&
                  filteredCollections.map((collection, index) => {
                    return (
                      <tr key={index}>
                        {tableMobileView && <td>{index + 1}</td>}
                        <th scope="row" className="row gap-4 border-bottom-0">
                          <div className="col-12">
                            <div className="coll_list_pp" style={{ cursor: 'pointer' }}>
                              <Link to={`/collection/${collection.slug}`}>
                                {collection.metadata?.avatar ? (
                                  <img className="lazy" src={collection.metadata.avatar} alt={collection?.name} />
                                ) : (
                                  <Blockies seed={collection.collection.toLowerCase()} size={10} scale={5} />
                                )}
                              </Link>
                            </div>
                            <span>
                              <Link to={`/collection/${collection.slug}`}>{collection?.name ?? 'Unknown'}</Link>
                            </span>
                          </div>

                          {!tableMobileView && (
                            <div className="col-12 row gap-1">
                              <div className="col-12 mobile-view-list-item">
                                <span>#</span>
                                <span>{index + 1}</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={sortCollections('totalVolume')}>
                                <span>Volume</span>
                                <span>{collectionTotalVolumeValue(collection)}</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={sortCollections('numberOfSales')}>
                                <span>Sales</span>
                                <span>{collectionNumberOfSalesValue(collection)}</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={sortCollections('floorPrice')}>
                                <span>Floor Price</span>
                                <span>{collectionFloorPriceValue(collection)}</span>
                              </div>
                              <div
                                className="col-12 mobile-view-list-item"
                                onClick={sortCollections('averageSalePrice')}
                              >
                                <span>Avg. Price</span>
                                <span>{collectionAverageSalePriceValue(collection)}</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={sortCollections('numberActive')}>
                                <span>Active Listings</span>
                                <span>{collectionNumberActiveValue(collection)}</span>
                              </div>
                            </div>
                          )}
                        </th>
                        {tableMobileView && <td>{collectionTotalVolumeValue(collection)}</td>}
                        {tableMobileView && <td>{collectionNumberOfSalesValue(collection)}</td>}
                        {tableMobileView && <td>{collectionFloorPriceValue(collection)}</td>}
                        {tableMobileView && <td>{collectionAverageSalePriceValue(collection)}</td>}
                        {tableMobileView && <td>{collectionNumberActiveValue(collection)}</td>}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Collections;
