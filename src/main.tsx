import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import SuperAdminApp from './SuperAdminApp.tsx';
import './index.css';

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path.startsWith('/super-admin') ? <SuperAdminApp isEmbedded={false} /> : <App />}
  </StrictMode>,
);
