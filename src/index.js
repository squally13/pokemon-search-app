import React from 'react';
import ReactDOM from 'react-dom/client';
// Import BrowserRouter here
import { BrowserRouter } from 'react-router-dom';

import './index.css'; // Optional global styles if you have them
import App from './App'; // Your main App component
// import reportWebVitals from './reportWebVitals'; // Optional

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap the entire App component with BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(); // Optional