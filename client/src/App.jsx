import { ChatPage } from './pages/ChatPage';
import { AuthPage } from './pages/AuthPage';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  return user ? <ChatPage /> : <AuthPage />;
};

export default App;
