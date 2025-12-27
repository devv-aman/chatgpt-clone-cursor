import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { MainLayout } from '@/components/layout';
import { Home } from '@/pages/Home';
import { Settings } from '@/pages/Settings';
import { ROUTES, type RoutePath } from '@/constants/routes';
import { STRINGS } from '@/constants/strings';
import { HOME_STRINGS } from '@/pages/Home/constants';
import { SETTINGS_STRINGS } from '@/pages/Settings/constants';

function renderWithRouter(initialRoute: RoutePath = ROUTES.HOME) {
  const router = createMemoryRouter(
    [
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
    ],
    { initialEntries: [initialRoute] }
  );

  return render(
    <ThemeProvider defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the home page by default', () => {
    renderWithRouter();
    
    expect(screen.getByText(HOME_STRINGS.TITLE)).toBeInTheDocument();
  });

  it('navigates to settings page when clicking settings link', async () => {
    const user = userEvent.setup();
    renderWithRouter();
    
    // Find the Settings link directly
    const settingsLink = screen.getByRole('link', { 
      name: STRINGS.NAVIGATION.SETTINGS 
    });
    
    await user.click(settingsLink);
    
    // Use heading role to avoid matching sidebar text
    expect(screen.getByRole('heading', { name: SETTINGS_STRINGS.TITLE })).toBeInTheDocument();
  });

  it('navigates back to home page when clicking home link', async () => {
    const user = userEvent.setup();
    renderWithRouter(ROUTES.SETTINGS);
    
    // Find the Home link directly (the one in navigation, not the logo)
    const homeLinks = screen.getAllByRole('link', { 
      name: STRINGS.NAVIGATION.HOME 
    });
    // Use the navigation link (not the logo)
    const homeLink = homeLinks[0];
    
    await user.click(homeLink);
    
    expect(screen.getByText(HOME_STRINGS.TITLE)).toBeInTheDocument();
  });

  it('shows active state on current navigation item', () => {
    renderWithRouter();
    
    // Find the Home navigation link
    const homeLinks = screen.getAllByRole('link', { 
      name: STRINGS.NAVIGATION.HOME 
    });
    const homeLink = homeLinks[0];
    
    // The link should have data-active attribute
    expect(homeLink).toHaveAttribute('data-active', 'true');
  });
});

describe('Theme Toggle Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('toggles between light and dark theme', async () => {
    const user = userEvent.setup();
    renderWithRouter();
    
    const themeButton = screen.getByRole('button', { 
      name: STRINGS.THEME.TOGGLE_LABEL 
    });
    
    // Initially should be light (based on mock)
    expect(themeButton).toBeInTheDocument();
    
    await user.click(themeButton);
    
    // After click, theme class should be added to document
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('persists theme preference', async () => {
    const user = userEvent.setup();
    
    renderWithRouter();
    
    const themeButton = screen.getByRole('button', { 
      name: STRINGS.THEME.TOGGLE_LABEL 
    });
    
    await user.click(themeButton);
    
    // Check localStorage was called (our mock tracks calls)
    // Theme toggle stores the new theme value
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', expect.any(String));
  });
});

