import React, { Component } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Clock from './Clock';
import styled, { createGlobalStyle } from 'styled-components';
import config from '../../Assets/networks/rpc_config.json';
import { humanize } from '../../utils';
import Blockies from 'react-blockies';
import LayeredIcon from './LayeredIcon';
import { faCheck, faChevronLeft, faChevronRight, faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ethers } from 'ethers';
import { dropState } from '../../core/api/enums';
export const drops = config.drops;

const GlobalStyles = createGlobalStyle`
  .nft-big .slick-prev::before{
    left: 0;
    line-height: 40px;
  }
  .nft-big .slick-next::before {
    right: 0;
    line-height: 40px;
  }
  .nft-big .slick-prev, .nft-big .slick-next{
    border: 1px solid #ccc;
    box-shadow: 5px 5px 30px 0px rgba(0, 0, 0, 0.2);
    width: 50px;
    height: 50px;
  }
  
  .nft__item_lg img {
    max-height: 700px;
  }
  @media only screen and (max-width: 1024px) {
    .nft__item_lg img{
      max-height: 450px;
    }
  }
`;

const VerifiedIcon = styled.span`
  font-size: 8px;
  color: #ffffff;
  background: $color;
  border-radius: 100%;
  -moz-border-radius: 100%;
  -webkit-border-radius: 100%;
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 2;
`;

class CustomSlide extends Component {
  render() {
    const { ...props } = this.props;
    return <div {...props}></div>;
  }
}

export default class Responsive extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.featuredDrops = drops;
    this.arrangeCollections();
  }

  // @todo refactor out
  isCroniesDrop(drop) {
    return drop.slug === 'cronies';
  }
  // @todo refactor out
  isFounderDrop(drop) {
    return drop.slug === 'founding-member';
  }

  calculateStatus(drop) {
    const sTime = new Date(drop.start);
    const eTime = new Date(drop.end);
    const now = new Date();

    if (sTime > now) return dropState.NOT_STARTED;
    else if (drop.currentSupply >= drop.totalSupply && drop.slug !== 'founding-member' && drop.slug !== 'cronies')
      return dropState.SOLD_OUT;
    else if (!drop.end || eTime > now) return dropState.LIVE;
    else if (drop.end && eTime < now) return dropState.EXPIRED;
    else return dropState.NOT_STARTED;
  }

  arrangeCollections() {
    const twelveHours = 3600000 * 12;
    const twoDays = 3600000 * 24 * 2;

    const topLevelDrops = drops.filter((d) => !d.complete && d.featured);
    const topLevelKeys = topLevelDrops.map(d => d.slug);

    const upcomingDrops = drops
      .filter(
        (d) => !d.complete &&
            d.published &&
            d.start &&
            d.start > Date.now() &&
            d.start - Date.now() < twelveHours &&
            !topLevelKeys.includes(d.slug)
      )
      .sort((a, b) => (a.start < b.start ? 1 : -1));
    let liveDrops = drops
      .filter(
          (d) =>
              !d.complete &&
              d.published &&
              d.start &&
              d.start < Date.now() &&
              !!d.imgPreview &&
              !topLevelKeys.includes(d.slug)
      )
      .sort((a, b) => (a.start < b.start ? 1 : -1));

    if (liveDrops.length > 3) {
      let c = 0;
      liveDrops = liveDrops
        .reverse()
        .filter((d) => {
          if (liveDrops.length - c <= 3) return true;

          if (Date.now() - d.start < twoDays || this.isFounderDrop(d)) {
            return true;
          }

          c++;
          return false;
        })
        .reverse();
    }
    this.featuredDrops = [...upcomingDrops, ...topLevelDrops, ...liveDrops];
  }

  navigateToDrop(drop) {
    if (drop.redirect) {
      window.open(drop.redirect, '_blank');
    } else {
      window.open(`/drops/${drop.slug}`, '_self');
    }
  }

  render() {
    var settings = {
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      initialSlide: 0,
      adaptiveHeight: 300,
      centerPadding: '100px',
      responsive: [
        {
          breakpoint: 1900,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
          },
        },
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
          },
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            initialSlide: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
          },
        },
      ],
    };

    const PrevArrow = (props) => {
      const { className, style, onClick } = props;
      return (
        <div className={className} style={style} onClick={onClick}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </div>
      );
    };

    const NextArrow = (props) => {
      const { className, style, onClick } = props;
      return (
        <div className={className} style={style} onClick={onClick}>
          <FontAwesomeIcon icon={faChevronRight} />
        </div>
      );
    };

    return (
      <div className="nft-big">
        <GlobalStyles />
        <Slider {...settings} prevArrow={<PrevArrow />} nextArrow={<NextArrow />}>
          {this.featuredDrops &&
            this.featuredDrops.map((drop, index) => (
              <CustomSlide className="itm" key={index}>
                <div className="nft__item_lg">
                  <div className="row align-items-center">
                    <div className="col-lg-6">
                      <img src={drop.imgPreview} className="img-fluid mx-auto" alt={drop.title} />
                    </div>
                    <div className="col-lg-6">
                      <div className="d-desc">
                        <h2>{drop.title}</h2>
                        <div className="d-author">
                          <div className="author_list_pp">
                            {drop.imgAvatar ? (
                              <img className="lazy" src={drop.imgAvatar} alt={drop.author.name} />
                            ) : (
                              <Blockies seed={drop.slug} size={10} scale={5} />
                            )}
                            <VerifiedIcon>
                              <LayeredIcon icon={faCheck} bgIcon={faCircle} shrink={7} />
                            </VerifiedIcon>
                          </div>
                          <div className="author_list_info">
                            <div className="title">{drop.author.name}</div>
                            <div className="subtitle">
                              {drop.author.link && (
                                <span className="profile_username">
                                  <a href={drop.author.link} target="_blank" rel="noreferrer">
                                    View Website
                                  </a>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="d-attr">
                          <div className="col">
                            <span className="d-title">Mint Price</span>
                            <h3>{ethers.utils.commify(drop.cost)} CRO</h3>
                            {drop.erc20Cost && drop.erc20Unit && (
                              <h3>
                                {ethers.utils.commify(drop.erc20Cost)} {drop.erc20Unit}
                              </h3>
                            )}
                            {drop.memberCost && <h5>Members: {ethers.utils.commify(drop.memberCost)} CRO</h5>}
                            {drop.erc20MemberCost && drop.erc20Unit && (
                              <h5>
                                Members: {ethers.utils.commify(drop.erc20MemberCost)} {drop.erc20Unit}
                              </h5>
                            )}
                            {drop.whitelistCost && <h5>Whitelist: {ethers.utils.commify(drop.whitelistCost)} CRO</h5>}
                            {drop.specialWhitelistCost && (
                              <h5>Special Whitelist: {ethers.utils.commify(drop.specialWhitelistCost)} CRO</h5>
                            )}
                          </div>
                          <div className="line my-auto"></div>
                          <div className="col my-auto">
                            {this.calculateStatus(drop) === dropState.NOT_STARTED && (
                              <>
                                <span className="d-title">Drop starts in</span>
                                <div className="de_countdown">
                                  <Clock deadline={drop.start} />
                                </div>
                                <h5>
                                  {new Date(drop.start).toDateString()}, {new Date(drop.start).toTimeString()}
                                </h5>
                              </>
                            )}
                            {this.calculateStatus(drop) === dropState.LIVE && <h3>Drop is Live!</h3>}
                            {this.calculateStatus(drop) === dropState.EXPIRED && <h3>Drop Ended</h3>}
                            {this.calculateStatus(drop) === dropState.SOLD_OUT && <h3>Sold Out</h3>}
                          </div>
                        </div>
                        <div className="spacer-10"></div>
                        <div className="d-buttons">
                          <span className="btn-main" onClick={() => this.navigateToDrop(drop)}>
                            View Drop
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CustomSlide>
            ))}
        </Slider>
      </div>
    );
  }
}
