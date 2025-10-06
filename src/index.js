import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Assumes your App.js is renamed to App.js, and this points to it
import './App.css'; // ONLY import your custom styles here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

