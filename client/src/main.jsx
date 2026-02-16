import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './styles/main.css';

const Providers = () => {
  const { token } = useAuth();
  return (
    <SocketProvider token={token}>
      <App />
    </SocketProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Providers />
    </AuthProvider>
  </React.StrictMode>
);
