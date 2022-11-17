import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { Card, Form, Spinner } from 'react-bootstrap';
import MetaMaskOnboarding from '@metamask/onboarding';
import { toast } from 'react-toastify';
import Countdown from 'react-countdown';

import config from '../../Assets/networks/rpc_config.json';
import AuctionContract from '../../Contracts/Auction.json';
import { caseInsensitiveCompare, createSuccessfulTransactionToastContent } from '../../utils';
import { auctionState } from '../../core/api/enums';
import { getAuctionDetails } from '../../GlobalState/auctionSlice';
import { chainConnect, connectAccount } from '../../GlobalState/User';

const BuyerActionBar = () => {
  const dispatch = useDispatch();

  const [bidAmount, setBidAmount] = useState(0);
  const [rebidAmount, setRebidAmount] = useState(0);
  // const [minimumBid, setMinimumBid] = useState(1);
  const [bidError, setBidError] = useState('');
  const [awaitingAcceptance, setAwaitingAcceptance] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isAuctionOwner, setIsAuctionOwner] = useState(false);
  const [executingBid, setExecutingBid] = useState(false);
  // const [executingIncreaseBid, setExecutingIncreaseBid] = useState(false);
  const [executingWithdraw, setExecutingWithdraw] = useState(false);
  const [executingAcceptBid, setExecutingAcceptBid] = useState(false);

  const user = useSelector((state) => state.user);
  const bidHistory = useSelector((state) => state.auction.bidHistory.filter((i) => !i.withdrawn));
  const listing = useSelector((state) => state.auction.auction);
  const minBid = useSelector((state) => state.auction.minBid);

  const isHighestBidder = useSelector((state) => {
    return listing.highestBidder && caseInsensitiveCompare(user.address, listing.highestBidder);
  });
  const [openBidDialog, setOpenBidDialog] = useState(false);
  const [openRebidDialog, setOpenRebidDialog] = useState(false);

  const showBidDialog = () => async () => {
    setOpenBidDialog(true);
  };
  const showIncreaseBidDialog = () => async () => {
    setOpenRebidDialog(true);
  };

  const executeBid = (amount) => async () => {
    setExecutingBid(true);
    await runFunction(async (writeContract) => {
      let bid = ethers.utils.parseUnits(amount.toString());
      console.log('placing bid...', listing.auctionId, listing.auctionHash, bid.toString());
      return (
        await writeContract.bid(listing.auctionHash, {
          value: bid,
        })
      ).wait();
    });
    setExecutingBid(false);
  };

  const executeWithdrawBid = () => async () => {
    setExecutingWithdraw(true);
    await runFunction(async (writeContract) => {
      console.log('withdrawing bid...', listing.auctionId, listing.auctionHash);
      return (await writeContract.withdraw(listing.auctionHash)).wait();
    });
    setExecutingWithdraw(false);
  };

  const executeAcceptBid = () => async () => {
    setExecutingAcceptBid(true);
    await runFunction(async (writeContract) => {
      console.log('accepting highest bid...', listing.auctionId, listing.auctionHash, listing.highestBidder);
      return (await writeContract.accept(listing.auctionHash)).wait();
    });
    setExecutingAcceptBid(false);
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
    // @todo set minimum bid
    setAwaitingAcceptance(listing.state === auctionState.ACTIVE && listing.endAt < Date.now());
    setIsComplete(listing.state === auctionState.SOLD || listing.state === auctionState.CANCELLED);
    setIsAuctionOwner(caseInsensitiveCompare(listing.seller, user.address));
  }, [listing, user]);

  const myBid = () => {
    return bidHistory.find((b) => caseInsensitiveCompare(b.bidder, user.address))?.price ?? 0;
  };

  const handleChangeBidAmount = (event) => {
    const { value } = event.target;
    const newBid = parseFloat(value);
    setBidAmount(newBid);

    if (newBid < minBid) {
      setBidError(`Bid must be at least ${minBid} CRO`);
    } else {
      setBidError(false);
    }
  };

  const handleChangeRebidAmount = (event) => {
    const { value } = event.target;
    const newBid = parseFloat(value);
    setRebidAmount(newBid);
    const minRebid = minBid - myBid();

    if (newBid < minRebid) {
      setBidError(`Bid must be increased by at least ${minRebid} CRO`);
    } else {
      setBidError(false);
    }
  };

  const ActionButtons = () => {
    const hasBeenOutbid = myBid() > 0 && !isHighestBidder;
    return (
      <>
        {listing.state === auctionState.ACTIVE && !isHighestBidder && !hasBeenOutbid && !awaitingAcceptance && (
          <span className="my-auto">
            <button className="btn-main lead mr15" onClick={showBidDialog()} disabled={executingBid}>
              Place Bid
            </button>
          </span>
        )}
        {hasBeenOutbid && (
          <span className="my-auto">
            <button className="btn-main lead mr15" onClick={executeWithdrawBid()} disabled={executingWithdraw}>
              {executingWithdraw ? (
                <>
                  Withdrawing
                  <Spinner animation="border" role="status" size="sm" className="ms-1">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              ) : (
                <>Withdraw Bid</>
              )}
            </button>
          </span>
        )}
        {listing.state === auctionState.ACTIVE && hasBeenOutbid && !awaitingAcceptance && (
          <span className="my-auto ms-2">
            <button className="btn-main lead mr15" onClick={showIncreaseBidDialog()} disabled={executingBid}>
              Increase Bid
            </button>
          </span>
        )}
        {listing.state === auctionState.ACTIVE && awaitingAcceptance && isHighestBidder && (
          <span className="my-auto">
            <button className="btn-main lead mr15" onClick={executeAcceptBid()} disabled={executingAcceptBid}>
              {executingAcceptBid ? (
                <>
                  Accepting
                  <Spinner animation="border" role="status" size="sm" className="ms-1">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              ) : (
                <>Accept Auction</>
              )}
            </button>
          </span>
        )}
      </>
    );
  };

  return (
    <div>
      <Card className="mb-4 border-1 shadow" style={{ color: '#141619', borderColor: '#cdcfcf' }}>
        {listing.state === auctionState.ACTIVE && !awaitingAcceptance && !isComplete && (
          <div
            className="text-center badge m-1 fs-6"
            style={{ backgroundImage: 'linear-gradient(to right, #35669e, #218cff)' }}
          >
            Ends in: <Countdown date={listing.endAt} />
          </div>
        )}
        <Card.Body>
          <div className="d-flex flex-row justify-content-between">
            <div
              className={`my-auto fw-bold ${
                !(myBid() > 0 && !isHighestBidder) && (awaitingAcceptance || isComplete) ? 'mx-auto' : ''
              }`}
              style={{ color: '#000' }}
            >
              {listing.state === auctionState.NOT_STARTED && (
                <>
                  <h6>Starting Bid:</h6>{' '}
                  <span className="fs-3 ms-1">{ethers.utils.commify(listing.highestBid)} CRO</span>
                </>
              )}
              {listing.state === auctionState.ACTIVE && bidHistory.length === 0 && !awaitingAcceptance && (
                <>
                  <h6>Starting Bid:</h6>{' '}
                  <span className="fs-3 ms-1">{ethers.utils.commify(listing.highestBid)} CRO</span>
                </>
              )}
              {listing.state === auctionState.ACTIVE && bidHistory.length > 0 && !awaitingAcceptance && (
                <>
                  <h6>Current Bid:</h6>{' '}
                  <span className="fs-3 ms-1">{ethers.utils.commify(listing.highestBid)} CRO</span>
                </>
              )}
              {listing.state === auctionState.ACTIVE && awaitingAcceptance && <>AUCTION HAS ENDED</>}
              {listing.state === auctionState.SOLD && (
                <>AUCTION HAS BEEN SOLD FOR {ethers.utils.commify(listing.highestBid)} CRO</>
              )}
              {listing.state === auctionState.CANCELLED && <>AUCTION HAS BEEN CANCELLED</>}
            </div>
            {((!isAuctionOwner && !isComplete) ||
              (awaitingAcceptance && isHighestBidder) ||
              (myBid() > 0 && !isHighestBidder)) && (
              <>
                {listing.state !== auctionState.NOT_STARTED ? (
                  <>
                    {user.address ? (
                      <>
                        {user.correctChain ? <ActionButtons /> : <span className="my-auto">Switch network to bid</span>}
                      </>
                    ) : (
                      <span className="my-auto">Connect wallet above to place bid</span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="my-auto">Auction has not started yet</span>
                  </>
                )}
              </>
            )}
          </div>
        </Card.Body>
      </Card>

      {openBidDialog && user && (
        <div className="checkout">
          <div className="maincheckout">
            <button className="btn-close" onClick={() => setOpenBidDialog(false)}>
              x
            </button>
            <div className="heading">
              <h3>Place Bid</h3>
            </div>
            <p>Your bid must be at least {minBid} CRO</p>
            <div className="heading mt-3">
              <p>Your bid (CRO)</p>
              <div className="subtotal">
                <Form.Control type="text" placeholder="Enter Bid" onChange={handleChangeBidAmount} />
              </div>
            </div>
            {bidError && (
              <div
                className="error"
                style={{
                  color: 'red',
                  marginLeft: '5px',
                }}
              >
                {bidError}
              </div>
            )}

            <button
              className="btn-main lead mb-5"
              onClick={executeBid(bidAmount)}
              disabled={!!bidError || executingBid}
            >
              {executingBid ? (
                <>
                  Confirming Bid...
                  <Spinner animation="border" role="status" size="sm" className="ms-1">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              ) : (
                <>Confirm Bid</>
              )}
            </button>
          </div>
        </div>
      )}

      {openRebidDialog && user && (
        <div className="checkout">
          <div className="maincheckout">
            <button className="btn-close" onClick={() => setOpenRebidDialog(false)}>
              x
            </button>
            <div className="heading">
              <h3>Increase Bid</h3>
            </div>
            <p>You must increase your bid by at least {minBid - myBid()} CRO</p>
            <div className="heading mt-3">
              <p>Increase Bid By (CRO)</p>
              <div className="subtotal">
                <Form.Control type="text" placeholder="Enter Bid" onChange={handleChangeRebidAmount} />
              </div>
            </div>
            {bidError && (
              <div
                className="error"
                style={{
                  color: 'red',
                  marginLeft: '5px',
                }}
              >
                {bidError}
              </div>
            )}

            <div className="heading">
              <p>Total Bid</p>
              <div className="subtotal">{parseFloat(myBid()) + parseFloat(rebidAmount)} CRO</div>
            </div>

            <button
              className="btn-main lead mb-5"
              onClick={executeBid(rebidAmount)}
              disabled={!!bidError || executingBid}
            >
              {executingBid ? (
                <>
                  Confirming Bid...
                  <Spinner animation="border" role="status" size="sm" className="ms-1">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              ) : (
                <>Confirm Bid</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default BuyerActionBar;
