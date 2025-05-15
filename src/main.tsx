
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';

const root = createRoot(document.getElementById("root")!);

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
