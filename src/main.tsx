import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { apolloClient } from '@/lib/apollo';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <TooltipProvider>
        <App />
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </ApolloProvider>
  </StrictMode>,
);
