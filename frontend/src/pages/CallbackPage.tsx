import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const CallbackPage: React.FC = () => {
  const { handleRedirectCallback, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        await handleRedirectCallback();
        navigate('/academies');
      } catch (e) {
        console.error("Error processing auth callback:", e);
        navigate('/');
      }
    };
    processAuthCallback();
  }, [handleRedirectCallback, navigate]);

  if (isLoading) {
    return <div>Loading authentication session...</div>;
  }

  if (error) {
    return <div>Authentication Error: {error.message}. <a href="/">Go Home</a></div>;
  }

  return <div>Processing authentication...</div>;
};

export default CallbackPage;
