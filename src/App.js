import React, { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ScrollToTopBtn from './Components/menu/ScrollToTop';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { AppRouter } from './Router/Router';
import { theme } from './Theme/theme';
import { toast, ToastContainer } from 'react-toastify';

import { initializeApp } from 'firebase/app';
import firebaseConfig from './Firebase/firebase_config';
import { initializeAnalytics } from 'firebase/analytics';
import { initProvider } from './GlobalState/User';
import { appInitializer } from './GlobalState/InitSlice';
import { fetchMintData } from './GlobalState/cronoverseSlice'
const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: smooth;
  }
  .jumbotron.tint{
    background-color: rgba(0,0,0,0.6);
    background-blend-mode: multiply;
  }
  .jumbotron.breadcumb.no-bg.tint {
    background-image: url('/img/background/Ebisu-DT-Header.webp');
    background-position: bottom;
  }
    
  @media only screen and (max-width: 768px) {
    .jumbotron.breadcumb.no-bg.tint {
      background-image: url('/img/background/Ebisu-Mobile-Header.webp');
      background-size: cover;
      background-repeat: no-repeat;
    }
  }
`;

function App() {
  const dispatch = useDispatch();

  const userTheme = useSelector((state) => {
    return state.user.theme;
  });

  useEffect(() => {
    dispatch(appInitializer());
    // dispatch(fetchMintData())
  }, [dispatch]);

  useLayoutEffect(() => {
    const firebase = initializeApp(firebaseConfig);
    initializeAnalytics(firebase);
    dispatch(initProvider());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <div className={'wraper ' + (userTheme === 'dark' ? 'greyscheme' : '')}>
        <GlobalStyles />
        <AppRouter firebase />
        <ScrollToTopBtn />
        <ToastContainer position={toast.POSITION.BOTTOM_LEFT} hideProgressBar={true} />
      </div>
    </ThemeProvider>
  );
}

export default App;
