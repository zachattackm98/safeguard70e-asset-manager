
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root outside of render to avoid hydration issues
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

root.render(<App />);
