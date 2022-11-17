import React, { memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory, Link } from 'react-router-dom';
import Blockies from 'react-blockies';
import { ethers } from 'ethers';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Helmet } from 'react-helmet';

import ProfilePreview from '../components/ProfilePreview';
import Footer from '../components/Footer';
import { humanize, relativePrecision, shortAddress, timeSince } from '../../utils';
import { getNftDetails } from '../../GlobalState/nftSlice';
import config from '../../Assets/networks/rpc_config.json';
import { croSkullRedPotionImageHack } from '../../hacks';
const knownContracts = config.known_contracts;

const Nft721 = ({ address, id }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const nft = useSelector((state) => state.nft.nft);
  const listings = useSelector((state) =>
    state.nft.history.filter((i) => i.state === 1).sort((a, b) => (a.saleTime < b.saleTime ? 1 : -1))
  );
  const powertraits = useSelector((state) => state.nft.nft?.powertraits);
  const collectionMetadata = useSelector((state) => {
    return knownContracts.find((c) => c.address.toLowerCase() === address.toLowerCase())?.metadata;
  });
  const collectionName = useSelector((state) => {
    return knownContracts.find((c) => c.address.toLowerCase() === address.toLowerCase())?.name;
  });

  useEffect(() => {
    dispatch(getNftDetails(address, id));
  }, [dispatch, id]);

  const viewSeller = (seller) => () => {
    history.push(`/seller/${seller}`);
  };

  const fullImage = () => {
    if (nft.original_image.startsWith('ipfs://')) {
      const link = nft.original_image.split('://')[1];
      return `https://ipfs.io/ipfs/${link}`;
    }

    return nft.original_image;
  };

  const [openMenu, setOpenMenu] = React.useState(0);
  const handleBtnClick = (index) => (element) => {
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.parentElement.classList.add('active');

    setOpenMenu(index);
    console.log(openMenu, index);
  };

  return (
    <div>
      <Helmet>
        <title>{nft?.name || 'NFT'} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${nft?.name || 'NFT'} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${nft?.name || 'NFT'} | Ebisu's Bay Marketplace`} />
        <meta property="og:title" content={`${nft?.name || 'NFT'} | Ebisu's Bay Marketplace`} />
        <meta property="og:url" content={`https://app.ebisusbay.com/nft/${address}`} />
        <meta property="og:image" content={nft?.image} />
        <meta name="twitter:title" content={`${nft?.name || 'NFT'} | Ebisu's Bay Marketplace`} />
        <meta name="twitter:image" content={nft?.image} />
      </Helmet>
      <section className="container">
        <div className="row mt-md-5 pt-md-4">
          <div className="col-md-6 text-center">
            {nft ? (
              nft.useIframe ? (
                <iframe width="100%" height="636" src={nft.iframeSource} />
              ) : (
                <img
                  src={croSkullRedPotionImageHack(address, nft.image)}
                  className="img-fluid img-rounded mb-sm-30"
                  alt={nft.name}
                />
              )
            ) : (
              <></>
            )}
            {nft && nft.original_image && (
              <div className="nft__item_action mt-2" style={{ cursor: 'pointer' }}>
                <span onClick={() => window.open(croSkullRedPotionImageHack(address, fullImage()), '_blank')}>
                  <span className="p-2">View Full Image</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </span>
              </div>
            )}
          </div>
          <div className="col-md-6">
            {nft && (
              <div className="item_info">
                <h2>{nft.name}</h2>
                <p>{nft.description}</p>
                <div className="row" style={{ gap: '2rem 0' }}>
                  <ProfilePreview
                    type="Collection"
                    title={collectionName ?? 'View Collection'}
                    avatar={collectionMetadata?.avatar}
                    address={address}
                    verified={collectionMetadata?.verified}
                    to={`/collection/${address}`}
                  />

                  {typeof nft.rank !== 'undefined' && nft.rank !== null && (
                    <ProfilePreview
                      type="Rarity Rank"
                      title={nft.rank}
                      avatar={collectionMetadata.rarity === 'rarity_sniper' ? '/img/rarity-sniper.png' : null}
                      hover={
                        collectionMetadata.rarity === 'rarity_sniper'
                          ? `Ranking provided by ${humanize(collectionMetadata.rarity)}`
                          : null
                      }
                    />
                  )}
                </div>

                <div className="spacer-40"></div>

                <div className="de_tab">
                  <ul className="de_nav">
                    <li id="Mainbtn0" className="tab active">
                      <span onClick={handleBtnClick(0)}>Details</span>
                    </li>
                    {powertraits && powertraits.length > 0 && (
                      <li id="Mainbtn1" className="tab">
                        <span onClick={handleBtnClick(1)}>In-Game Attributes</span>
                      </li>
                    )}
                    <li id="Mainbtn2" className="tab">
                      <span onClick={handleBtnClick(2)}>History</span>
                    </li>
                  </ul>

                  <div className="de_tab_content">
                    {openMenu === 0 && (
                      <div className="tab-1 onStep fadeIn">
                        {(nft.attributes && Array.isArray(nft.attributes) && nft.attributes.length > 0) ||
                        (nft.properties && Array.isArray(nft.properties) && nft.properties.length > 0) ? (
                          <div className="d-block mb-3">
                            <div className="row mt-5 gx-3 gy-2">
                              {nft.attributes &&
                                Array.isArray(nft.attributes) &&
                                nft.attributes
                                  .filter((a) => a.value !== 'None')
                                  .map((data, i) => {
                                    return (
                                      <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                        <a className="nft_attr">
                                          <h5>{humanize(data.trait_type)}</h5>
                                          <h4>{humanize(data.value)}</h4>
                                          {data.occurrence ? (
                                            <span>{relativePrecision(data.occurrence)}% have this trait</span>
                                          ) : (
                                            data.percent && <span>{data.percent}% have this trait</span>
                                          )}
                                        </a>
                                      </div>
                                    );
                                  })}
                              {nft.properties &&
                                Array.isArray(nft.properties) &&
                                nft.properties.map((data, i) => {
                                  return (
                                    <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                      <div className="nft_attr">
                                        <h5>{humanize(data.trait_type)}</h5>
                                        <h4>{humanize(data.value)}</h4>
                                        {data.occurrence ? (
                                          <span>{Math.round(data.occurrence * 100)}% have this trait</span>
                                        ) : (
                                          data.percent && <span>{data.percent}% have this trait</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ) : (
                          <>
                            <span>No traits found for this item</span>
                          </>
                        )}
                      </div>
                    )}
                    {openMenu === 1 && (
                      <div className="tab-2 onStep fadeIn">
                        {powertraits && powertraits.length > 0 ? (
                          <>
                            <div className="d-block mb-3">
                              <div className="row mt-5 gx-3 gy-2">
                                {powertraits.map((data, i) => {
                                  return (
                                    <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                      <div className="nft_attr">
                                        <h5>{data.trait_type}</h5>
                                        <h4>{data.value > 0 ? <>+ {data.value}</> : <>{data.value}</>}</h4>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <span>No in-game attributes found for this item</span>
                          </>
                        )}
                      </div>
                    )}
                    {openMenu === 2 && (
                      <div className="tab-3 onStep fadeIn">
                        {listings && listings.length > 0 ? (
                          <>
                            {listings.map((listing, index) => (
                              <div className="p_list" key={index}>
                                <Link to={`/seller/${listing.purchaser}`}>
                                  <div className="p_list_pp">
                                    <span>
                                      <span onClick={viewSeller(listing.purchaser)}>
                                        <Blockies seed={listing.purchaser} size={10} scale={5} />
                                      </span>
                                    </span>
                                  </div>
                                </Link>
                                <div className="p_list_info">
                                  <span>{timeSince(listing.saleTime + '000')} ago</span>
                                  Bought by{' '}
                                  <b>
                                    <Link to={`/seller/${listing.purchaser}`}>{shortAddress(listing.purchaser)}</Link>
                                  </b>{' '}
                                  for <b>{ethers.utils.commify(listing.price)} CRO</b>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            <span>No history found for this item</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default memo(Nft721);
