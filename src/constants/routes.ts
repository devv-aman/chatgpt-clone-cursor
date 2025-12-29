export const ROUTES = {
  CHAT: '/',
  CHAT_WITH_ID: '/chat/:chatId',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

export const getRoutePath = {
  chat: (chatId?: string) => (chatId ? `/chat/${chatId}` : '/'),
} as const;

