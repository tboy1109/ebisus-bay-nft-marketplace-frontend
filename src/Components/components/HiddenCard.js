import React, { memo } from 'react';
import Opesc from '../../Assets/opesc.jpg';

const HiddenCard = () => {
  return (
    <a href="https://www.magbrewvikings.com/" target="_blank" rel="noreferrer">
      <div className="card eb-nft__card h-100 shadow">
        <img src={Opesc} className={`card-img-top marketplace`} alt="Shh, it's a secret" />
        <div className="badge bg-rarity-none text-wrap mt-1 mx-1">Rank: N/A</div>
        <div className="card-body d-flex flex-column"></div>
      </div>
    </a>
  );
};

export default memo(HiddenCard);
