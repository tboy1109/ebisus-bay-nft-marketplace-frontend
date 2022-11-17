import React, { memo } from 'react';
import { Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const MintButton = ({ mintCallback, maxMintPerTx, numToMint, title, text = 'Mint', isERC20 }) => {
  const user = useSelector((state) => {
    return state.user;
  });

  return (
    <>
      {user.connectingWallet ? (
        <button className="btn-main lead mb-5" disabled>
          <Spinner animation="border" role="status" size="sm">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </button>
      ) : (
        <button className="btn-main lead mb-5 mx-2" onClick={() => mintCallback(isERC20)}>
          {title ? (
            <>{title}</>
          ) : (
            <>
              {maxMintPerTx && maxMintPerTx > 1 ? (
                <>
                  {text} {numToMint}
                </>
              ) : (
                <>{text}</>
              )}
            </>
          )}
        </button>
      )}
    </>
  );
};

export default memo(MintButton);
