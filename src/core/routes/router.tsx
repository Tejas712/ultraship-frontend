import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/core/routes/app-routes';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
