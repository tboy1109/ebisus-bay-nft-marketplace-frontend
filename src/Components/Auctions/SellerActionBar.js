import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { createGlobalStyle } from 'styled-components';
import { ethers } from 'ethers';
import config from '../../Assets/networks/rpc_config.json';
import AuctionContract from '../../Contracts/Auction.json';
import { toast } from 'react-toastify';
import { caseInsensitiveCompare, createSuccessfulTransactionToastContent } from '../../utils';
import { ERC721 } from '../../Contracts/Abis';
import { Card, Form, Spinner } from 'react-bootstrap';
import { auctionState } from '../../core/api/enums';
import { getAuctionDetails } from '../../GlobalState/auctionSlice';
import MetaMaskOnboarding from '@metamask/onboarding';
import { chainConnect, connectAccount } from '../../GlobalState/User';

const SellerActionBar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [awaitingAcceptace, setAwaitingAcceptace] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [executingStart, setExecutingStart] = useState(false);
  const [executingCancel, setExecutingCancel] = useState(false);
  const [executingAcceptBid, setExecutingAcceptBid] = useState(false);
  const listing = useSelector((state) => state.auction.auction);

  const executeStartAuction = () => async () => {
    setExecutingStart(true);
    await runFunction(async (writeContract) => {
      console.log('starting auction...', listing.auctionId, listing.auctionHash);
      return (await writeContract.start(listing.auctionHash)).wait();
    });
    setExecutingStart(false);
  };

  const executeCancelAuction = () => async () => {
    setExecutingCancel(true);
    await runFunction(async (writeContract) => {
      console.log('cancelling auction...', listing.auctionId, listing.auctionHash);
      return (await writeContract.cancel(listing.auctionHash)).wait();
    });
    setExecutingCancel(false);
  };

  const executeAcceptBid = () => async () => {
    setExecutingAcceptBid(true);
    await runFunction(async (writeContract) => {
      console.log('accepting highest bid...', listing.auctionId, listing.auctionHash, listing.highestBidder);
      return (await writeContract.accept(listing.auctionHash)).wait();
    });
    setExecutingAcceptBid(false);
  };

  const executeIncreaseAuctionTime = (minutes) => async () => {
    await runFunction(async (writeContract) => {
      console.log(`adding ${minutes}m to the auction time...`, listing.auctionId, listing.auctionHash);
      return (await writeContract.updateRuntime(listing.auctionHash, minutes)).wait();
    });
  };

  const runFunction = async (fn) => {
    if (user.address) {
      try {
        let writeContract = await new ethers.Contract(
          config.auction_contract,
          AuctionContract.abi,
          user.provider.getSigner()
        );
        const receipt = await fn(writeContract);
        toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
        dispatch(getAuctionDetails(listing.auctionId));
      } catch (error) {
        if (error.data) {
          toast.error(error.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          console.log(error);
          toast.error('Unknown Error');
        }
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

  useEffect(() => {
    setAwaitingAcceptace(listing.state === auctionState.ACTIVE && listing.endAt < Date.now());
    setIsComplete(listing.state === auctionState.SOLD || listing.state === auctionState.CANCELLED);
  }, [listing]);

  return (
    <div className="mt-4">
      <h4>Seller Options</h4>
      <div className="d-flex flex-row justify-content-between">
        {user.address ? (
          <>
            {listing.state === auctionState.NOT_STARTED && (
              <button className="btn-main lead mb-5 mr15" onClick={executeStartAuction()} disabled={executingStart}>
                {executingStart ? (
                  <>
                    Starting
                    <Spinner animation="border" role="status" size="sm" className="ms-1">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </>
                ) : (
                  <>Start Auction</>
                )}
              </button>
            )}
            {!awaitingAcceptace && !isComplete && (
              <>
                <button className="btn-main lead mb-5 mr15" onClick={executeCancelAuction()} disabled={executingCancel}>
                  {executingCancel ? (
                    <>
                      Cancelling
                      <Spinner animation="border" role="status" size="sm" className="ms-1">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </>
                  ) : (
                    <>Cancel</>
                  )}
                </button>
                <button className="btn-main lead mb-5 mr15" onClick={executeIncreaseAuctionTime(5)}>
                  Increase Time (5m)
                </button>
              </>
            )}
            {awaitingAcceptace && !isComplete && (
              <button className="btn-main lead mb-5 mr15" onClick={executeAcceptBid()} disabled={executingAcceptBid}>
                {executingAcceptBid ? (
                  <>
                    Accepting Bid
                    <Spinner animation="border" role="status" size="sm" className="ms-1">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </>
                ) : (
                  <>Accept Bid</>
                )}
              </button>
            )}
          </>
        ) : (
          <>
            <span>Connect wallet above to manage auction</span>
          </>
        )}
      </div>
    </div>
  );
};
export default SellerActionBar;
