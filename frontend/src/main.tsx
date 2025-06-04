import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.tsx';
import './index.css'; // Assuming a global css file

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
// Construct callbackURL relative to the current origin, ensuring it's a full URL
const callbackUrl = `${window.location.origin}/callback`;

if (!domain || !clientId) {
  throw new Error("Auth0 domain or client ID not set in environment variables. VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID must be defined in your .env file.");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: callbackUrl
      }}
      // cacheLocation="localstorage" // Optional: Consider for better UX
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);
