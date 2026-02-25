import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from './app/App';
import { queryClient } from './app/queryClient';
import './shared/theme/tokens.css';
import './shared/theme/theme.css';
import './shared/theme/app-surfaces.css';
import './shared/ui/typography.css';
import './shared/theme/global.css';
import { initSentry } from './shared/monitoring/sentry';

initSentry();

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
