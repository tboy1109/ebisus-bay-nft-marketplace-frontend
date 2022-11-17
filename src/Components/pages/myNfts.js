import React, { memo, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { getAnalytics, logEvent } from '@firebase/analytics';

import Footer from '../components/Footer';
import NftCardList from '../components/MyNftCardList';
import MyNftTransferDialog from '../components/MyNftTransferDialog';
import MyNftCancelDialog from '../components/MyNftCancelDialog';
import MyNftListDialog from '../components/MyNftListDialog';
import { fetchNfts } from '../../GlobalState/User';

const mapStateToProps = (state) => ({
  walletAddress: state.user.address,
  isLoading: state.user.fetchingNfts,
});

const MyNfts = ({ walletAddress, isLoading }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLoading) {
      dispatch(fetchNfts());
    }

    logEvent(getAnalytics(), 'screen_view', {
      firebase_screen: 'my_nfts',
    });
    // disable-eslint-next-line
  }, []);

  if (!walletAddress) {
    return <Redirect to="/marketplace" />;
  }

  return (
    <div>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>My NFTs</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <NftCardList />
        <MyNftTransferDialog />
        <MyNftCancelDialog />
        <MyNftListDialog />
      </section>

      <Footer />
    </div>
  );
};
export default connect(mapStateToProps)(memo(MyNfts));
