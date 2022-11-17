import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const InvalidListingWarning = function (props) {
  const history = useHistory();

  const walletAddress = useSelector((state) => {
    return state.user.address;
  });

  const correctChain = useSelector((state) => {
    return state.user.correctChain;
  });

  const myUnfilteredListings = useSelector((state) => {
    return state.user.myUnfilteredListings;
  });

  return (
    <div className="mainside-warning">
      {walletAddress && correctChain && myUnfilteredListings.some((x) => !x.valid && x.listed) && (
        <div className="de-menu-profile p-3">
          <span onClick={() => history.push('/wallet/listings')}>
            <FontAwesomeIcon color="var(--bs-danger)" size={props.size} icon={faExclamationCircle} />
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(InvalidListingWarning);
