import React from 'react';
import ReactDOM from 'react-dom';
import './Assets/styles/animated.css';
import '../node_modules/elegant-icons/style.css';
import '../node_modules/et-line/style.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import 'react-toastify/dist/ReactToastify.css';
import './Assets/styles/style.scss';
import './Assets/styles/style_grey.scss';
import './Assets/styles/override.scss';
import App from './App';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import store from './Store/store';
import { SentryLoggingService } from './services/sentry-logging.service';
import { Site24x7LoggingService } from './services/site24x7-logging.service';
import 'babel-polyfill';

SentryLoggingService.init();
Site24x7LoggingService.init();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
