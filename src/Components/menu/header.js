import React, { useEffect, useState } from 'react';
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from 'react-socks';
import { header } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import AccountMenu from '../components/AccountMenu';
import { createGlobalStyle } from 'styled-components';
import InvalidListingWarning from '../components/InvalidListingWarning';

setDefaultBreakpoints([{ xs: 0 }, { l: 1199 }, { xl: 1200 }]);

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #0078cb;
    border-bottom: 0;
    box-shadow: 0 4px 20px 0 rgba(10,10,10, .8);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
    background: #fff;
  }
  @media only screen and (max-width: 1199px) { 
    .navbar{
      background: #0078cb;
      border-bottom: 0;
      box-shadow: 0 4px 20px 0 rgba(10,10,10, .8);
    }
  }
`;

const Header = function () {
  const [showmenu, btn_icon] = useState(false);

  useEffect(() => {
    const header = document.getElementById('myHeader');
    const totop = document.getElementById('eb-scroll-to-top');
    const sticky = header.offsetTop;
    const scrollCallBack = window.addEventListener('scroll', () => {
      btn_icon(false);
      if (window.pageYOffset > sticky) {
        header.classList.add('sticky');
        totop.classList.add('show');
      } else {
        header.classList.remove('sticky');
        totop.classList.remove('show');
      }
    });
    return () => {
      window.removeEventListener('scroll', scrollCallBack);
    };
  }, []);

  return (
    <header id="myHeader" className="navbar white">
      <GlobalStyles />
      <div className="container">
        <div className="row w-100-nav">
          <div className="logo px-0">
            <div className="navbar-title navbar-item">
              <NavLink to="/">
                <img height="40px" src="/img/logo.png" className="img-fluid d-block" alt="#" />
              </NavLink>
            </div>
          </div>

          <BreakpointProvider>
            <Breakpoint l down>
              {showmenu && (
                <div className="menu">
                  <div className="menu">
                    <div className="navbar-item">
                      <NavLink to="/home">
                        Home
                        <span className="lines"></span>
                      </NavLink>
                    </div>
                    <div className="navbar-item">
                      <NavLink to="/marketplace">
                        Marketplace
                        <span className="lines"></span>
                      </NavLink>
                    </div>
                    <div className="navbar-item">
                      <NavLink to="/collections">
                        Collections
                        <span className="lines"></span>
                      </NavLink>
                    </div>
                    <div className="navbar-item">
                      <NavLink to="/drops">
                        Drops
                        <span className="lines"></span>
                      </NavLink>
                    </div>
                  </div>
                </div>
              )}
            </Breakpoint>

            <Breakpoint xl>
              <div className="menu">
                <div className="navbar-item">
                  <NavLink to="/home">
                    Home
                    <span className="lines"></span>
                  </NavLink>
                </div>
                <div className="navbar-item">
                  <NavLink to="/marketplace">
                    Marketplace
                    <span className="lines"></span>
                  </NavLink>
                </div>
                <div className="navbar-item">
                  <NavLink to="/collections">
                    Collections
                    <span className="lines"></span>
                  </NavLink>
                </div>
                <div className="navbar-item">
                  <NavLink to="/drops">
                    Drops
                    <span className="lines"></span>
                  </NavLink>
                </div>
              </div>
            </Breakpoint>
          </BreakpointProvider>

          <AccountMenu />
          <InvalidListingWarning size={'2x'} />
        </div>

        <button className="nav-icon" onClick={() => btn_icon(!showmenu)}>
          <div className="menu-line white"></div>
          <div className="menu-line1 white"></div>
          <div className="menu-line2 white"></div>
        </button>
      </div>
    </header>
  );
};
export default Header;
