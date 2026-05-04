import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: '12px 16px',
          maxWidth: '360px',
        },
        success: {
          style: { background: '#EAF3DE', color: '#2D6A0F', border: '1px solid #B8D98C' },
          iconTheme: { primary: '#2D6A0F', secondary: '#EAF3DE' },
        },
        error: {
          style: { background: '#FCEBEB', color: '#C0392B', border: '1px solid #F7C1C1' },
          iconTheme: { primary: '#C0392B', secondary: '#FCEBEB' },
        },
        loading: {
          style: { background: '#EBF3FC', color: '#1B5EA0', border: '1px solid #B5D4F4' },
        },
      }}
    />
  </>
);