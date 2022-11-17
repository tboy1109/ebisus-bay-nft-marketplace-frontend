import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

import { createSuccessfulTransactionToastContent } from '../../utils';
import CreateAuction from '../Auctions/CreateAuction';
import ManageAuctionList from '../Auctions/ManageAuctionList';
import config from '../../Assets/networks/rpc_config.json';
import AuctionContract from '../../Contracts/Auction.json';

const ManageAuctions = () => {
  const user = useSelector((state) => state.user);

  const [nftAddress, setNftAddress] = useState('');
  const [nftId, setNftId] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [openMenu, setOpenMenu] = React.useState(0);

  const handleBtnClick = (index) => (element) => {
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.parentElement.classList.add('active');

    setOpenMenu(index);
  };

  async function onCreatePressed() {
    let bid = ethers.utils.parseUnits(startingBid);
    let writeContract = await new ethers.Contract(
      config.auction_contract,
      AuctionContract.abi,
      user.provider.getSigner()
    );
    console.log('preparing contract...', nftAddress, nftId, bid);
    try {
      const tx = await writeContract.createAuction(nftAddress, nftId, bid);
      const receipt = await tx.wait();
      toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <GlobalStyles />

      <section
        className="jumbotron breadcumb no-bg"
        style={{ backgroundImage: `url(${'/img/background/subheader-blue.webp'})` }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>Auction Management</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="de_tab">
          <ul className="de_nav">
            <li id="Mainbtn0" className="tab active">
              <span onClick={handleBtnClick(0)}>Auctions</span>
            </li>
            <li id="Mainbtn1" className="tab">
              <span onClick={handleBtnClick(1)}>Create</span>
            </li>
          </ul>

          <div className="de_tab_content mt-3">
            {openMenu === 0 && <ManageAuctionList />}
            {openMenu === 1 && <CreateAuction />}
          </div>
        </div>
      </section>
    </div>
  );
};
export default ManageAuctions;
