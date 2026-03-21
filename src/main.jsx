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
    navigator.serviceWorker.register('/j-voca/sw.js').catch(() => {});
  });
}

// 서버의 version.json과 로컬 빌드 시각을 비교하여 새 버전 감지
fetch('/j-voca/version.json?' + Date.now())
  .then(r => r.json())
  .then(({ build }) => {
    if (build && build !== __BUILD_TIME__) {
      window.__HAS_UPDATE__ = true;
      window.dispatchEvent(new Event('version-updated'));
    }
  })
  .catch(() => {});
