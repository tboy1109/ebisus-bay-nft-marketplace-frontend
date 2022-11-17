import React, { memo } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import moment from 'moment';

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
  height: 100%;
`;

const SoldNftCard = ({ nft, index, className = 'col-sm-12 col-md-12 col-lg-6 d-item', width, onImgLoad }) => {
  const history = useHistory();

  const navigateTo = (link) => {
    history.push(link);
  };

  const viewListingDetails = () => {
    navigateTo(`/listing/${nft.listingId}`);
  };

  return (
    <div className={className} key={index}>
      <div className="nft_sold__item d-flex flex-row gap-3" onClick={viewListingDetails}>
        <div style={{ height: `100px` }}>
          <div className="h-100" style={width ? { width: `${width}px` } : {}}>
            <Outer>
              <img onLoad={onImgLoad} className="h-100" src={nft.nft.image} alt={nft.nft.name} />
            </Outer>
          </div>
        </div>
        <div className="nft__item_info">
          <span>
            <h4>{nft.nft.name}</h4>
          </span>
          <div className="nft__item_price">
            <span className="m-0">Sold for {ethers.utils.commify(nft.price)} CRO</span>
          </div>
          <div className="has_offers">{moment(new Date(nft.saleTime * 1000)).format('DD/MM/YYYY, HH:mm')}</div>
        </div>
      </div>
    </div>
  );
};

export default memo(SoldNftCard);
