import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import App from './pages/app';
import './index.css';

import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';

const instance = createInstance({
  urlBase: 'https://analytics.insiderstats.com',
  siteId: 7
})

ReactDOM.render(
  <MatomoProvider value={instance}>
    <App />
  </MatomoProvider>, 
document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
