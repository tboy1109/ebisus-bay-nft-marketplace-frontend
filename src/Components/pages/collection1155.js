import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Contract, ethers } from 'ethers';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import Blockies from 'react-blockies';
import { Helmet } from 'react-helmet';
import Footer from '../components/Footer';
import CollectionListingsGroup from '../components/CollectionListingsGroup';
import CollectionFilterBar from '../components/CollectionFilterBar';
import LayeredIcon from '../components/LayeredIcon';
import { init, fetchListings, getStats } from '../../GlobalState/collectionSlice';
import {
  caseInsensitiveCompare,
  isCrosmocraftsPartsCollection,
  isFounderCollection,
  siPrefixedNumber
} from '../../utils';
import TraitsFilter from '../Collection/TraitsFilter';
import PowertraitsFilter from '../Collection/PowertraitsFilter';
import SocialsBar from '../Collection/SocialsBar';
import { SortOption } from '../Models/sort-option.model';
import { FilterOption } from '../Models/filter-option.model';
import config from '../../Assets/networks/rpc_config.json';
import Market from '../../Contracts/Marketplace.json';

const knownContracts = config.known_contracts;

const Collection1155 = ({ address, tokenId=null, cacheName = 'collection' }) => {
  const dispatch = useDispatch();

  const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
  const readMarket = new Contract(config.market_contract, Market.abi, readProvider);

  const [royalty, setRoyalty] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const collectionCachedTraitsFilter = useSelector((state) => state.collection.cachedTraitsFilter);
  const collectionCachedSort = useSelector((state) => state.collection.cachedSort);
  const collectionStats = useSelector((state) => state.collection.stats);

  const listings = useSelector((state) => state.collection.listings);
  const hasRank = useSelector((state) => state.collection.hasRank);
  const canLoadMore = useSelector((state) => {
    return (
      state.collection.listings.length > 0 &&
      (state.collection.query.page === 0 || state.collection.query.page < state.collection.totalPages)
    );
  });

  const collectionMetadata = useSelector((state) => {
    return knownContracts.find((c) => c.address.toLowerCase() === address.toLowerCase())?.metadata;
  });

  const collectionName = () => {
    let contract;
    if (tokenId != null) {
      contract = knownContracts.find((c) => caseInsensitiveCompare(c.address, address) && c.id === tokenId);
    } else {
      contract = knownContracts.find((c) => caseInsensitiveCompare(c.address, address));
    }

    return contract ? contract.name : 'Collection';
  };

  // const handleCopy = (code) => () => {
  //   navigator.clipboard.writeText(code);
  //   toast.success('Copied!');
  // };

  const hasTraits = () => {
    return collectionStats?.traits != null;
  };

  const hasPowertraits = () => {
    return collectionStats?.powertraits != null;
  };

  const loadMore = () => {
    dispatch(fetchListings());
  };

  useEffect(() => {
    const sortOption = SortOption.default();
    sortOption.key = 'listingId';
    sortOption.direction = 'desc';
    sortOption.label = 'By Id';

    const filterOption = FilterOption.default();
    filterOption.type = 'collection';
    filterOption.address = address;
    if (tokenId != null) {
      filterOption.id = tokenId;
    }
    filterOption.name = 'Specific collection';

    dispatch(
      init(
        filterOption,
        collectionCachedSort[cacheName] ?? sortOption,
        collectionCachedTraitsFilter[address] ?? {},
        address
      )
    );
    dispatch(fetchListings());
    // eslint-disable-next-line
  }, [dispatch, address]);

  useEffect(() => {
    let extraData;
    if (tokenId != null) {
      extraData = knownContracts.find((c) => caseInsensitiveCompare(c.address, address) && c.id === tokenId);
    } else {
      extraData = knownContracts.find((c) => caseInsensitiveCompare(c.address, address));
    }

    if (extraData) {
      setMetadata(extraData.metadata);
    }
  }, [address]);

  useEffect(() => {
    async function asyncFunc() {
      if (tokenId != null) {
        dispatch(getStats(address, tokenId));
      } else {
        dispatch(getStats(address));
      }
      try {
        let royalties = await readMarket.royalties(address);
        setRoyalty(Math.round(royalties[1]) / 100);
      } catch (error) {
        console.log('error retrieving royalties for collection', error);
        setRoyalty('N/A');
      }
    }
    asyncFunc();
    // eslint-disable-next-line
  }, [dispatch, address]);

  return (
    <div>
      <Helmet>
        <title>{collectionName()} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${collectionName()} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${collectionName()} | Ebisu's Bay Marketplace`} />
        <meta property="og:title" content={`${collectionName()} | Ebisu's Bay Marketplace`} />
        <meta property="og:url" content={`https://app.ebisusbay.com/collection/${address}`} />
        <meta property="og:image" content={`https://app.ebisusbay.com${collectionMetadata?.avatar || '/'}`} />
        <meta name="twitter:title" content={`${collectionName()} | Ebisu's Bay Marketplace`} />
        <meta name="twitter:image" content={`https://app.ebisusbay.com${collectionMetadata?.avatar || '/'}`} />
      </Helmet>
      <section
        id="profile_banner"
        className="jumbotron breadcumb no-bg"
        style={{
          backgroundImage: `url(${metadata?.banner ? metadata.banner : '/img/background/subheader-blue.webp'})`,
          backgroundPosition: '50% 50%',
        }}
      >
        <div className="mainbreadcumb"></div>
      </section>

      <section className="container d_coll no-top no-bottom">
        <div className="row">
          <div className="col-md-12">
            <div className="d_profile">
              <div className="profile_avatar">
                <div className="d_profile_img">
                  {metadata?.avatar ? (
                    <img src={metadata.avatar} alt={collectionName()} />
                  ) : (
                    <Blockies seed={address.toLowerCase()} size={15} scale={10} />
                  )}
                  {metadata?.verified && (
                    <LayeredIcon icon={faCheck} bgIcon={faCircle} shrink={8} stackClass="eb-avatar_badge" />
                  )}
                </div>

                <div className="profile_name">
                  <h4>
                    {collectionName()}
                    <div className="clearfix" />
                    <SocialsBar collection={knownContracts.find((c) => caseInsensitiveCompare(c.address, address))} />
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container no-top">
        {collectionStats && (
          <div className="row">
            {hasRank && collectionMetadata?.rarity === 'rarity_sniper' && (
              <div className="row">
                <div className="col-lg-8 col-sm-10 mx-auto text-center text-sm-end fst-italic" style={{ fontSize: '0.8em' }}>
                  Rarity scores and ranks provided by{' '}
                  <a href="https://raritysniper.com/" target="_blank" rel="noreferrer">
                    <span className="color">Rarity Sniper</span>
                  </a>
                </div>
              </div>
            )}
            <div className="d-item col-lg-8 col-sm-10 mb-4 mx-auto">
              <div className="nft_attr">
                <div className="row">
                  <div className="col-md-2 col-xs-4">
                    <h5>Floor</h5>
                    {collectionStats.floorPrice ? (
                      <h4>{siPrefixedNumber(Number(collectionStats.floorPrice).toFixed(0))} CRO</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Volume</h5>
                    {collectionStats.totalVolume ? (
                      <h4>{siPrefixedNumber(Number(collectionStats.totalVolume).toFixed(0))} CRO</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Sales</h5>
                    {collectionStats.numberOfSales ? (
                      <h4>{siPrefixedNumber(collectionStats.numberOfSales)}</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Avg. Sale</h5>
                    {collectionStats.averageSalePrice ? (
                      <h4>{siPrefixedNumber(Number(collectionStats.averageSalePrice).toFixed(0))} CRO</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Royalty</h5>
                    {royalty ? <h4>{royalty}%</h4> : <h4>-</h4>}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Active Listings</h5>
                    {collectionStats.numberActive ? (
                      <h4>{siPrefixedNumber(collectionStats.numberActive)}</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {isCrosmocraftsPartsCollection(address) && (
              <div className="row">
                <div className="mx-auto text-center fw-bold" style={{ fontSize: '0.8em' }}>
                  Collect Crosmocraft parts to {' '}
                  <a href="/build-ship">
                    <span className="color">build your Crosmocraft!</span>
                  </a>
                </div>
              </div>
            )}
            {collectionMetadata?.staking === 'crodex' && (
              <div className="row">
                <div className="mx-auto text-center fw-bold" style={{ fontSize: '0.8em' }}>
                  NFTs from this collection can be staked at {' '}
                  <a href="https://swap.crodex.app/#/rewards/nft" target="_blank" rel="noreferrer">
                    <span className="color">Crodex</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="row">
          <CollectionFilterBar showFilter={false} cacheName={cacheName} />
        </div>
        <div className="row">
          {(hasTraits() || hasPowertraits()) && (
            <div className="col-md-3 mb-4">
              {hasTraits() && <TraitsFilter address={address} />}
              {hasPowertraits() && <PowertraitsFilter address={address} />}
            </div>
          )}
          <div className={hasTraits() || hasPowertraits() ? 'col-md-9' : 'col-md-12'}>
            <CollectionListingsGroup listings={listings} canLoadMore={canLoadMore} loadMore={loadMore} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Collection1155;
