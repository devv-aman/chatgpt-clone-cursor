import { createBrowserRouter } from "react-router-dom";
import { MainLayout, ProtectedRoute } from "@/components/layout";
import { Chat } from "@/pages/Chat";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/NotFound";
import { Login, Register, AuthLayout } from "@/pages/Auth";
import { ROUTES } from "@/constants/routes";

export const router = createBrowserRouter([
  // Auth routes (public, redirect to home if authenticated)
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <Login />,
      },
      {
        path: ROUTES.REGISTER,
        element: <Register />,
      },
    ],
  },
  // Protected routes (require authentication)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.CHAT,
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Chat />,
          },
          {
            path: ROUTES.CHAT_WITH_ID,
            element: <Chat />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <Settings />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
