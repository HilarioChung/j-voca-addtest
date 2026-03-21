import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Apply saved font size
const savedSize = localStorage.getItem('font-size') || 'base';
document.documentElement.className = `font-${savedSize}`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/j-voca/sw.js').then(reg => {
      // 새 SW가 설치되면 업데이트 플래그 설정
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (newSW) {
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'activated') {
              window.__SW_UPDATED__ = true;
              window.dispatchEvent(new Event('sw-updated'));
            }
          });
        }
      });
    }).catch(() => {});
  });
}
