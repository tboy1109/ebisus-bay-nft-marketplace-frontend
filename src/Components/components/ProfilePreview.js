import React, { memo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { getShortIdForView } from '../../utils';
import { Link } from 'react-router-dom';

import Blockies from 'react-blockies';
import LayeredIcon from './LayeredIcon';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';

const GlobalStyles = createGlobalStyle`
`;

const VerifiedIcon = styled.span`
  font-size: 8px;
  color: #ffffff;
  background: $color;
  border-radius: 100%;
  -moz-border-radius: 100%;
  -webkit-border-radius: 100%;
  position: absolute;
  bottom: 0px;
  right: 0px;
  z-index: 2;
`;

const ProfilePreview = ({
  type = '',
  title = '',
  to = '',
  address = '',
  avatar = '',
  verified = false,
  hover = '',
}) => {
  const AvatarElement = (
    <>
      {(avatar || address) && (
        <div className="author_list_pp">
          <span>
            {avatar !== '' ? (
              <img className="lazy" src={avatar} alt={title} title={hover} />
            ) : address !== '' ? (
              <Blockies seed={address.toLowerCase()} size={10} scale={5} />
            ) : (
              <></>
            )}
            {verified && (
              <VerifiedIcon>
                <LayeredIcon icon={faCheck} bgIcon={faCircle} shrink={8} />
              </VerifiedIcon>
            )}
          </span>
        </div>
      )}
      <div className="author_list_info">
        <span>{title || getShortIdForView(address)}</span>
      </div>
    </>
  );

  return (
    <div className="col">
      <h6>{type}</h6>
      <div className="item_author">
        {to !== '' ? <Link to={to}> {AvatarElement} </Link> : <div> {AvatarElement} </div>}
      </div>
    </div>
  );
};

export default memo(ProfilePreview);
