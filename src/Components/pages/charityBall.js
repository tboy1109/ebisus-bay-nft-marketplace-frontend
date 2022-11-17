import React from 'react';
// import { useDispatch } from 'react-redux';
// import { keyframes } from '@emotion/react';
// import Reveal from 'react-awesome-reveal';
// import Countdown from 'react-countdown';

import Footer from '../components/Footer';
import AuctionCollection from '../components/AuctionCollection';
import CharityBallCarousel from '../components/CharityBallCarousel';
// import DropsCarousel from '../components/DropsCarousel';
import config from '../../Assets/networks/rpc_config.json';

export const drops = config.drops;

// const statuses = {
//   UNSET: -1,
//   NOT_STARTED: 0,
//   LIVE: 1,
//   EXPIRED: 2,
//   SOLD_OUT: 3,
// };

// const fadeInUp = keyframes`
//   0% {
//     opacity: 0;
//     -webkit-transform: translateY(40px);
//     transform: translateY(40px);
//   }
//   100% {
//     opacity: 1;
//     -webkit-transform: translateY(0);
//     transform: translateY(0);
//   }
// `;

const CharityBall = () => {
  // const cacheName = 'charityball';

  // const dispatch = useDispatch();
  // const drop = config.drops.find((d) => d.slug === 'space-crystal-unicorns');
  // const [status, setStatus] = useState(statuses.UNSET);

  // const calculateStatus = (drop) => {
  //   const sTime = new Date(drop.start);
  //   const eTime = new Date(drop.end);
  //   const now = new Date();

  //   if (sTime > now) setStatus(statuses.NOT_STARTED);
  //   else if (drop.currentSupply >= drop.totalSupply) setStatus(statuses.SOLD_OUT);
  //   else if (!drop.end || eTime > now) setStatus(statuses.LIVE);
  //   else if (drop.end && eTime < now) setStatus(statuses.EXPIRED);
  //   else setStatus(statuses.NOT_STARTED);
  // };

  return (
    <div>
      <section className="jumbotron breadcumb no-bg" style={{ backgroundImage: `url(${'./img/background/12.webp'})` }}>
        <div className="container pt0 pt-3">
          <div className="row">
            <CharityBallCarousel />
          </div>
        </div>
      </section>
      <section className="container no-bottom">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Charity Auctions</h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className="col-lg-12">
            <AuctionCollection />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default CharityBall;
