import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // This is where your Tailwind gets loaded!
import App from './App'; // Make sure this path points to your App.tsx

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
