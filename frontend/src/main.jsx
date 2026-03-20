import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store } from './store/index.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a1030',
              color: '#e2d9f3',
              border: '1px solid rgba(139,92,246,0.3)',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#1a1030' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1a1030' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
