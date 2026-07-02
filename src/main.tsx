import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from './App';
import { AppThemeProvider } from './theme';
import { ProgressProvider } from './hooks/useProgress';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </AppThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
