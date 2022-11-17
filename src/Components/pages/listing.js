import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Contract, ethers } from 'ethers';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Blockies from 'react-blockies';
import { faCrow, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Sentry from '@sentry/react';
import { Helmet } from 'react-helmet';

import ProfilePreview from '../components/ProfilePreview';
import LayeredIcon from '../components/LayeredIcon';
import Footer from '../components/Footer';
import { getListingDetails, listingUpdated } from '../../GlobalState/listingSlice';
import { connectAccount, chainConnect } from '../../GlobalState/User';
import {
  findCollectionByAddress,
  createSuccessfulTransactionToastContent,
  humanize,
  isCroCrowCollection, isCrosmocraftsPartsDrop,
  relativePrecision,
  shortAddress,
  timeSince,
} from '../../utils';
import config from '../../Assets/networks/rpc_config.json';
import { croSkullRedPotionImageHack } from '../../hacks';

const knownContracts = config.known_contracts;

const Listing = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const listing = useSelector((state) => state.listing.listing);
  const history = useSelector((state) =>
    state.listing.history.filter((i) => i.state === 1).sort((a, b) => (a.saleTime < b.saleTime ? 1 : -1))
  );
  const powertraits = useSelector((state) => state.listing.powertraits);
  const isLoading = useSelector((state) => state.listing.loading);
  const user = useSelector((state) => state.user);

  const collection = useSelector((state) => {
    if (listing) {
      return findCollectionByAddress(listing.nftAddress, listing.is1155 ? listing.nftId : null);
    }
  });

  const [openCheckout, setOpenCheckout] = React.useState(false);
  // const [buying, setBuying] = useState(false);
  const [croCrowBreed, setCroCrowBreed] = useState(null);

  useEffect(() => {
    dispatch(getListingDetails(id));
  }, [dispatch, id]);

  useEffect(async () => {
    if (listing && isCroCrowCollection(listing.nftAddress) && croCrowBreed === null) {
      const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
      const contract = new Contract(
        '0x0f1439a290e86a38157831fe27a3dcd302904055',
        [
          'function availableCrows(address _owner) public view returns (uint256[] memory, bool[] memory)',
          'function isCrowUsed(uint256 tokenId) public view returns (bool)',
        ],
        readProvider
      );
      try {
        if (listing.nftId < 3500) {
          const used = await contract.isCrowUsed(listing.nftId);
          setCroCrowBreed(used);
        } else {
          const crows = await contract.availableCrows(listing.seller);
          for (const [i, o] of crows[0].entries()) {
            if (o.toNumber() === listing.nftId) {
              setCroCrowBreed(crows[1][i]);
              return;
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [listing]);

  const fullImage = () => {
    if (listing.nft.original_image.startsWith('ipfs://')) {
      const link = listing.nft.original_image.split('://')[1];
      return `https://ipfs.io/ipfs/${link}`;
    }

    return listing.nft.original_image;
  };

  const [openMenu, setOpenMenu] = React.useState(0);
  const handleBtnClick = (index) => (element) => {
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.parentElement.classList.add('active');

    setOpenMenu(index);
  };

  const showBuy = () => async () => {
    if (user.address) {
      // setBuying(true);
      try {
        let price = listing.price;
        if (typeof price === 'string') {
          price = ethers.utils.parseEther(price);
        }

        const tx = await user.marketContract.makePurchase(listing.listingId, {
          value: price,
        });
        const receipt = await tx.wait();
        dispatch(
          listingUpdated({
            listing: {
              ...listing,
              state: 1,
              purchaser: user.address,
            },
          })
        );
        toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
      } catch (error) {
        Sentry.captureException(error);
        if (error.data) {
          toast.error(error.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          console.log(error);
          toast.error('Unknown Error');
        }
      } finally {
        // setBuying(false);
      }
    } else {
      if (user.needsOnboard) {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
      } else if (!user.address) {
        dispatch(connectAccount());
      } else if (!user.correctChain) {
        dispatch(chainConnect());
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>{listing?.nft?.name || 'Listing'} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${listing?.nft?.name || 'Listing'} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${listing?.nft?.name || 'Listing'} | Ebisu's Bay Marketplace`} />
        <meta property="og:title" content={`${listing?.nft?.name || 'Listing'} | Ebisu's Bay Marketplace`} />
        <meta property="og:url" content={`https://app.ebisusbay.com/${id}`} />
        <meta property="og:image" content={listing?.nft?.image} />
        <meta name="twitter:title" content={`${listing?.nft?.name || 'Listing'} | Ebisu's Bay Marketplace`} />
        <meta name="twitter:image" content={listing?.nft?.image} />
      </Helmet>
      {isLoading ? (
        <section className="container">
          <div className="row mt-4">
            <div className="col-lg-12 text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </div>
        </section>
      ) : (
        <section className="container">
          <div className="row mt-md-5 pt-md-4">
            <div className="col-md-6 text-center">
              {listing ? (
                listing.useIframe ? (
                  <iframe width="100%" height="636" src={listing.iframeSource} />
                ) : (
                  <img
                    src={croSkullRedPotionImageHack(listing.nftAddress, listing.nft.image)}
                    className="img-fluid img-rounded mb-sm-30"
                    alt={listing.nft.name}
                  />
                )
              ) : (
                <></>
              )}
              {listing && listing.nft.original_image && (
                <div className="nft__item_action mt-2" style={{ cursor: 'pointer' }}>
                  <span
                    onClick={() => window.open(croSkullRedPotionImageHack(listing.nftAddress, fullImage()), '_blank')}
                  >
                    <span className="p-2">View Full Image</span>
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </span>
                </div>
              )}
            </div>
            <div className="col-md-6">
              {listing && (
                <div className="item_info">
                  <h2>{listing.nft.name}</h2>
                  <h3>{ethers.utils.commify(listing.price)} CRO</h3>
                  <p>{listing.nft.description}</p>
                  {isCroCrowCollection(listing.nftAddress) && croCrowBreed && (
                    <div className="d-flex flex-row align-items-center mb-4">
                      <LayeredIcon
                        icon={faCrow}
                        bgColor={'#ed7a11'}
                        color={'#000'}
                        inverse={false}
                        title="This crow has been bred to create a CrowPunk!"
                      />
                      <span className="fw-bold">This CRO Crow has been bred for a CrowPunk</span>
                    </div>
                  )}
                  <div className="row" style={{ gap: '2rem 0' }}>
                    <ProfilePreview type="Seller" address={listing.seller} to={`/seller/${listing.seller}`} />
                    <ProfilePreview
                      type="Collection"
                      title={collection.name}
                      avatar={collection.metadata.avatar}
                      address={listing.nftAddress}
                      verified={collection.metadata.verified}
                      to={`/collection/${collection.slug}`}
                    />
                    {typeof listing.nft.rank !== 'undefined' && listing.nft.rank !== null && (
                      <ProfilePreview
                        type="Rarity Rank"
                        title={listing.nft.rank}
                        avatar={collection.metadata.rarity === 'rarity_sniper' ? '/img/rarity-sniper.png' : null}
                        hover={
                          collection.metadata.rarity === 'rarity_sniper'
                            ? `Ranking provided by ${humanize(collection.metadata.rarity)}`
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
                          {(listing.nft.attributes && Array.isArray(listing.nft.attributes) && listing.nft.attributes.length > 0) ||
                          (listing.nft.properties && Array.isArray(listing.nft.properties) && listing.nft.properties.length > 0) ? (
                            <>
                              <div className="d-block mb-3">
                                <div className="row mt-5 gx-3 gy-2">
                                  {listing.nft.attributes && Array.isArray(listing.nft.attributes) && listing.nft.attributes
                                    .filter((data) => data.value !== 'None')
                                    .map((data, i) => {
                                      return (
                                        <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                          <div className="nft_attr">
                                            <h5>{humanize(data.trait_type)}</h5>
                                            <h4>{humanize(data.value)}</h4>
                                            {data.occurrence ? (
                                              <span>{relativePrecision(data.occurrence)}% have this trait</span>
                                            ) : (
                                              data.percent && <span>{data.percent}% have this trait</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  {listing.nft.properties &&
                                    Array.isArray(listing.nft.properties) &&
                                    listing.nft.properties.map((data, i) => {
                                      return (
                                          <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                            <div className="nft_attr">
                                              <h5>{humanize(data.trait_type)}</h5>
                                              <h4>{humanize(isCrosmocraftsPartsDrop(collection.address) ? data.Value : data.value)}</h4>
                                              {data.occurrence ? (
                                                  <span>{relativePrecision(data.occurrence)}% have this trait</span>
                                              ) : (
                                                  data.percent && <span>{data.percent}% have this trait</span>
                                              )}
                                            </div>
                                          </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </>
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
                          {history && history.length > 0 ? (
                            <>
                              {history.map((item, index) => (
                                <div className="p_list" key={index}>
                                  <Link to={`/seller/${item.purchaser}`}>
                                    <div className="p_list_pp">
                                      <span>
                                        <span>
                                          <Blockies seed={item.purchaser} size={10} scale={5} />
                                        </span>
                                      </span>
                                    </div>
                                  </Link>
                                  <div className="p_list_info">
                                    <span>{timeSince(item.saleTime + '000')} ago</span>
                                    Bought by{' '}
                                    <b>
                                      <Link to={`/seller/${item.purchaser}`}>{shortAddress(item.purchaser)}</Link>
                                    </b>{' '}
                                    for <b>{ethers.utils.commify(item.price)} CRO</b>
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

                      {/* button for checkout */}
                      {listing.state === 0 ? (
                        <div className="d-flex flex-row mt-5">
                          <button className="btn-main lead mb-5 mr15" onClick={showBuy()}>
                            Buy Now
                          </button>
                        </div>
                      ) : (
                        <div className="mt-5">LISTING HAS BEEN {listing.state === 1 ? 'SOLD' : 'CANCELLED'}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
      {openCheckout && user && (
        <div className="checkout">
          <div className="maincheckout">
            <button className="btn-close" onClick={() => setOpenCheckout(false)}>
              x
            </button>
            <div className="heading">
              <h3>Checkout</h3>
            </div>
            <p>
              You are about to purchase a <span className="bold">{listing.nft.name}</span>
            </p>
            <div className="heading mt-3">
              <p>Your balance</p>
              <div className="subtotal">{ethers.utils.formatEther(user.balance)} CRO</div>
            </div>
            <div className="heading">
              <p>Service fee 2.5%</p>
              <div className="subtotal">0.00325 ETH</div>
            </div>
            <div className="heading">
              <p>You will pay</p>
              <div className="subtotal">0.013325 ETH</div>
            </div>
            <button className="btn-main lead mb-5">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Listing);
