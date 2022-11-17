import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {Link, useHistory} from 'react-router-dom';
import { keyframes } from '@emotion/react';
import Reveal from 'react-awesome-reveal';
import { createGlobalStyle, default as styled } from 'styled-components';

import Footer from '../components/Footer';
import ListingCollection from '../components/ListingCollection';
import HotCollections from '../components/HotCollections';
import CurrentDrops from '../components/CurrentDrops';
import { getMarketData } from '../../GlobalState/marketplaceSlice';
import { siPrefixedNumber } from '../../utils';
import { theme } from '../../Theme/theme';
import {faFire} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;
const inline = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
  .d-inline{
    display: inline-block;
   }
`;

const GlobalStyles = createGlobalStyle`
  .header-card {
    background: #FFFFFFDD;
    border-radius: 10px;
  }
    
  .de_count h3 {
    font-size: 36px;
    margin-bottom: 0px;
  }
  
  .promo {
    padding-bottom: 8px;
    background: #15B619;
    color: #fff;
    animation: mymove 6s infinite alternate-reverse;
  }
  
  @keyframes mymove {
    from {background-color: #15B619;}
    to {background-color: #b63d15;}
  }

  @media only screen and (max-width: 1199.98px) {
    .min-width-on-column > span {
      min-width: 200px;
    }  
    .promo {
      padding: 12px 0 !important;
    } 
  }
  
  @media only screen and (max-width: 464px) {
    .header-card .call-to-action {
        text-align: center !important
    }
    
    //  jumbotron
    .h-vh {
      height: unset !important;
      min-height: 100vh;
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
  }
`;

const Jumbotron = {
  Host: styled.div.attrs(({ theme }) => ({
    className: '',
  }))`
    background-image: url('/img/background/Ebisus-bg-1_L.webp');
    background-size: cover;
    height: max(100vh, 800px);
    display: flex;
    align-items: center;

    @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
      max-width: ${({ theme }) => theme.breakpoints.md};
      height: 200px;
    }
  `,
  Data: styled.div.attrs(({ theme }) => ({
    className: '',
  }))`
    max-width: 700px;

    padding: 1.5rem !important;
    display: flex;
    flex-direction: column;
    gap: 30px;
    background: #ffffffdd;
    border-radius: 10px;
  `,
};

const Home = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const [mobile, setMobile] = useState(window.innerWidth < theme.breakpointsNum.md);

  const marketData = useSelector((state) => {
    return state.marketplace.marketData;
  });

  useEffect(() => {
    const breakpointObserver = ({ target }) => {
      const { innerWidth } = target;
      const newValue = innerWidth < theme.breakpointsNum.md;
      setMobile(newValue);
    };

    window.addEventListener('resize', breakpointObserver);

    return () => {
      window.removeEventListener('resize', breakpointObserver);
    };
  }, [dispatch]);

  const navigateTo = (link) => {
    history.push(link);
  };

  useEffect(async function () {
    dispatch(getMarketData());

    // dispatch(fetchMintData)
  }, []);

  const JumbotronData = () => {
    return (
      <Jumbotron.Data>
        <h6>
          <span className="text-uppercase color">Ebisu's Bay Marketplace</span>
        </h6>
        <Reveal className="onStep" keyframes={fadeInUp} delay={300} duration={900} triggerOnce>
          <h1>
            Discover <span className="color">rare</span> digital art and collect NFTs
          </h1>
        </Reveal>
        <Reveal className="onStep" keyframes={fadeInUp} delay={600} duration={900} triggerOnce>
          <p className="lead">
            Ebisu's Bay is the first NFT marketplace on Cronos. Create, buy, sell, trade and enjoy the #CroFam NFT
            community.
          </p>
        </Reveal>
        <Reveal className="onStep call-to-action" keyframes={inline} delay={800} duration={900} triggerOnce>
          <div className="min-width-on-column mb-2 w-100 d-inline-flex flex-column flex-md-row flex-lg-column flex-xl-row gap-3   align-items-center">
            <span
              onClick={() => window.open('/marketplace', '_self')}
              className="m-0 text-nowrap p-4 pt-2 pb-2 btn-main inline lead"
            >
              Explore
            </span>

            <span
              onClick={() => window.open(`/collection/founding-member`, '_self')}
              className="m-0 text-nowrap p-4 pt-2 pb-2 btn-main btn-outline inline white lead"
              style={{ outline: '1px solid #DDD' }}
            >
              <FontAwesomeIcon icon={faFire} className="me-1" style={{color:'#ff690e'}} />
              Become a Founding Member
            </span>
          </div>
        </Reveal>
        <Reveal className="onStep d-inline" keyframes={inline} delay={900} duration={1200} triggerOnce>
          <div className="row">
            <div className="spacer-single"></div>
            {marketData && (
              <div className="row">
                <div className="col-4 col-sm-4 col-md-4 col-12  mb30 ">
                  <div className="de_count text-center text-md-start">
                    <h3>
                      <span>{siPrefixedNumber(Number(marketData.totalVolume).toFixed(0))}</span>
                    </h3>
                    <h5 className="id-color">Volume</h5>
                  </div>
                </div>

                <div className="col-4 col-sm-4 col-md-4 col-12 mb30 ">
                  <div className="de_count text-center text-md-start">
                    <h3>
                      <span>{siPrefixedNumber(Number(marketData.totalSales).toFixed(0))}</span>
                    </h3>
                    <h5 className="id-color">NFTs Sold</h5>
                  </div>
                </div>

                <div className="col-4 col-sm-4 col-md-4 col-12 mb30 ">
                  <div className="de_count text-center text-md-start">
                    <h3>
                      <span>{siPrefixedNumber(marketData.totalActive)}</span>
                    </h3>
                    <h5 className="id-color">Active Listings</h5>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </Jumbotron.Data>
    );
  };

  return (
    <div>
      <GlobalStyles />
      {/*<section className="promo">*/}
      {/*  <div className="d-flex justify-content-center px-3">*/}
      {/*    <p className="my-auto me-3">*/}
      {/*      Founding Member NFTs are over 90% minted! Grab one now to enjoy amazing discounts on drops and 50% off service fees.{' '}*/}
      {/*      <span className="fw-bold d-block d-md-inline-block text-end">*/}
      {/*      <Link to="/drops/founding-member">Learn More &gt;</Link>*/}
      {/*    </span>*/}
      {/*    </p>*/}
      {/*  </div>*/}
      {/*</section>*/}
      <Jumbotron.Host>{!mobile && <div className="container">{JumbotronData()}</div>}</Jumbotron.Host>
      {mobile && JumbotronData()}

      <section className="container no-bottom">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Current Drops</h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className="col-lg-12">
            <CurrentDrops />
          </div>
        </div>
      </section>

      <section className="container no-bottom">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Hot Collections</h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className="col-lg-12">
            <HotCollections />
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>New Listings</h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className="col-lg-12">
            <ListingCollection showLoadMore={false} />
          </div>
          <div className="col-lg-12">
            <div className="spacer-single"></div>
            <span onClick={() => navigateTo(`/marketplace`)} className="btn-main lead m-auto">
              View Marketplace
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Home;
