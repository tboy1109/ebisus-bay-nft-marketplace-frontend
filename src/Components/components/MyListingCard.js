import React, { memo } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import config from '../../Assets/networks/rpc_config.json';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
  height: 100%;
`;

const MyListingCard = ({
  nft,
  className = 'col-sm-12 col-md-12 col-lg-6 d-item',
  width,
  onImgLoad,
  canCancel = false,
  canUpdate = false,
  onCancelButtonPressed,
  onUpdateButtonPressed,
}) => {
  const history = useHistory();

  const navigateTo = (link) => {
    console.log(canUpdate);
    history.push(link);
  };

  const viewListingDetails = () => {
    navigateTo(`/listing/${nft.listingId}`);
  };

  const nftUrl = () => {
    return `/collection/${nft.address}/${nft.id}`;
  };

  const onCopyLinkButtonPressed = (url) => () => {
    console.log(nft.rank);
    navigator.clipboard.writeText(url);
    toast.success('Copied!');
  };

  return (
    <>
      <Card style={nft.valid ? {} : { backgroundColor: '#ffadad' }} className="h-100">
        <Card.Body className="d-flex flex-column">
          <div className="row">
            <div className="col-md-4 my-auto text-center">
              <img src={nft.image} className="img-fluid rounded-start" alt="" />
            </div>
            <div className="col-md-8">
              <h5 className="card-title mx-auto">{nft.name}</h5>
              <p className="card-text">
                Listing ID: {nft.listingId}
                <br />
                Price: {ethers.utils.commify(nft.price)} CRO
                <br />
                {nft.rank && (
                  <>
                    Rank: {nft.rank} <br />
                  </>
                )}
                Listing Time: {nft.listingTime} UTC
                <br />
                {!nft.valid ? (
                  <>
                    Valid: {nft.valid.toString().charAt(0).toUpperCase() + nft.valid.toString().slice(1)}
                    <span>
                      {' '}
                      <FontAwesomeIcon color="var(--bs-danger)" icon={faExclamationCircle} size={'1x'} />{' '}
                    </span>
                    <br />
                  </>
                ) : (
                  <>
                    Valid: {nft.valid.toString().charAt(0).toUpperCase() + nft.valid.toString().slice(1)}
                    <br />
                  </>
                )}
              </p>
            </div>
          </div>
        </Card.Body>
        <Card.Footer className="d-flex flex-wrap justify-content-center justify-content-md-end">
          {canUpdate && (
            <button
              className="btn-main mx-1 mt-2"
              onClick={onUpdateButtonPressed}
              style={{ cursor: 'pointer', color: 'black' }}
            >
              Update
            </button>
          )}
          {canCancel && (
            <button
              className="btn-main mx-1 mt-2"
              onClick={onCancelButtonPressed}
              style={{ cursor: 'pointer', color: 'black' }}
            >
              Cancel
            </button>
          )}
          <button
            className="btn-main mx-1 mt-2"
            onClick={onCopyLinkButtonPressed(new URL(nftUrl(), config.app_base))}
            style={{ cursor: 'pointer', color: 'black' }}
          >
            <FontAwesomeIcon icon={faLink} />
          </button>
        </Card.Footer>
      </Card>
    </>
  );
};

export default memo(MyListingCard);
