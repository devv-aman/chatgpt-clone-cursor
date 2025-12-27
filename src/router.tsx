import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Home } from '@/pages/Home';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';
import { ROUTES } from '@/constants/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

