import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Footer from '../components/Footer';
// import TopFilterBar from '../components/TopFilterBar';
import MySoldNftCollection from '../components/MySoldNftCollection';

const MySales = () => {
  const walletAddress = useSelector((state) => state.user.address);

  const Content = () => (
    <>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>My Sales</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <MySoldNftCollection walletAddress={walletAddress} />
      </section>

      <Footer />
    </>
  );

  return <div>{walletAddress ? <Content /> : <Redirect to="/marketplace" />}</div>;
};

export default MySales;
