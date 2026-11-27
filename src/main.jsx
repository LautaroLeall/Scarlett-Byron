import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { APP_RELEASE_VERSION } from './data/weddingData.js';
import { syncAppReleaseVersion } from './utils/releaseReset.js';
import App from './App.jsx';
import './index.css';

// Limpia almacenamiento local, cookies y caché previa si el dispositivo tenía una versión anterior
syncAppReleaseVersion(APP_RELEASE_VERSION);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
