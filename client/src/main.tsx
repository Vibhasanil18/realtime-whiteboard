import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { initKeycloak } from './services/KeycloakService.ts';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

initKeycloak().then((authenticated) => {
  if (authenticated) {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.warn('User is not authenticated');
  }
}).catch((error) => {
  console.error('Keycloak initialization failed:', error);
});
