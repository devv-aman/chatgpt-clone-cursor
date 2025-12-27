import { test, expect } from '@playwright/test';

const ROUTES = {
  HOME: '/',
  SETTINGS: '/settings',
};

const STRINGS = {
  APP_NAME: 'React Boilerplate',
  NAVIGATION: {
    HOME: 'Home',
    SETTINGS: 'Settings',
  },
  THEME: {
    TOGGLE_LABEL: 'Toggle theme',
  },
};

const HOME_STRINGS = {
  TITLE: 'Hello World',
};

const SETTINGS_STRINGS = {
  TITLE: 'Settings',
};

const NOT_FOUND_STRINGS = {
  ERROR_CODE: '404',
  TITLE: 'Page Not Found',
  GO_HOME: 'Go Home',
};

test.describe('Home Page', () => {
  test('displays Hello World title', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    
    await expect(page.getByRole('heading', { name: HOME_STRINGS.TITLE })).toBeVisible();
  });

  test('has correct page title structure', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    
    await expect(page.getByRole('heading', { level: 1 })).toContainText(HOME_STRINGS.TITLE);
  });
});

test.describe('Navigation', () => {
  test('navigates from home to settings', async ({ page, isMobile }) => {
    await page.goto(ROUTES.HOME);
    
    // On mobile, need to open sidebar first
    if (isMobile) {
      await page.locator('[data-sidebar="trigger"]').click();
      await expect(page.locator('[data-slot="sidebar"][data-mobile="true"]')).toBeVisible();
    }
    
    await page.getByRole('link', { name: STRINGS.NAVIGATION.SETTINGS }).click();
    
    // Wait for navigation and sidebar to auto-close on mobile
    await expect(page).toHaveURL(ROUTES.SETTINGS);
    
    if (isMobile) {
      // Sidebar should auto-close after navigation
      await expect(page.locator('[data-slot="sidebar"][data-mobile="true"]')).not.toBeVisible();
    }
    
    await expect(page.getByRole('heading', { name: SETTINGS_STRINGS.TITLE })).toBeVisible();
  });

  test('navigates from settings to home', async ({ page, isMobile }) => {
    await page.goto(ROUTES.SETTINGS);
    
    // On mobile, need to open sidebar first
    if (isMobile) {
      await page.locator('[data-sidebar="trigger"]').click();
      await expect(page.locator('[data-slot="sidebar"][data-mobile="true"]')).toBeVisible();
    }
    
    await page.getByRole('link', { name: STRINGS.NAVIGATION.HOME }).click();
    
    // Wait for navigation and sidebar to auto-close on mobile
    await expect(page).toHaveURL(ROUTES.HOME);
    
    if (isMobile) {
      // Sidebar should auto-close after navigation
      await expect(page.locator('[data-slot="sidebar"][data-mobile="true"]')).not.toBeVisible();
    }
    
    await expect(page.getByRole('heading', { name: HOME_STRINGS.TITLE })).toBeVisible();
  });

  test('sidebar shows app name', async ({ page, isMobile }) => {
    // Skip on mobile as sidebar is hidden by default
    test.skip(isMobile, 'Sidebar is hidden on mobile');
    
    await page.goto(ROUTES.HOME);
    
    await expect(page.getByText(STRINGS.APP_NAME)).toBeVisible();
  });

  test('sidebar auto-closes after navigation on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Auto-close test is for mobile only');
    
    await page.goto(ROUTES.HOME);
    
    // Open sidebar
    await page.locator('[data-sidebar="trigger"]').click();
    await expect(page.locator('[data-slot="sidebar"][data-mobile="true"]')).toBeVisible();
    
    // Navigate
    await page.getByRole('link', { name: STRINGS.NAVIGATION.SETTINGS }).click();
    
    // Sidebar should auto-close
    await expect(page.locator('[data-slot="sidebar"][data-mobile="true"]')).not.toBeVisible();
  });
});

test.describe('Theme Toggle', () => {
  test('toggles between light and dark theme', async ({ page, isMobile }) => {
    await page.goto(ROUTES.HOME);
    
    // On mobile, need to open sidebar first to access theme toggle
    if (isMobile) {
      await page.locator('[data-sidebar="trigger"]').click();
      await page.waitForTimeout(300);
    }
    
    // Get initial theme state
    const html = page.locator('html');
    const initialIsDark = await html.evaluate((el) => el.classList.contains('dark'));
    
    // Click theme toggle
    await page.getByRole('button', { name: STRINGS.THEME.TOGGLE_LABEL }).click();
    
    // Check theme has changed
    const newIsDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(newIsDark).not.toBe(initialIsDark);
  });

  test('persists theme preference across page reload', async ({ page, isMobile }) => {
    await page.goto(ROUTES.HOME);
    
    // On mobile, need to open sidebar first
    if (isMobile) {
      await page.locator('[data-sidebar="trigger"]').click();
      await page.waitForTimeout(300);
    }
    
    // Set to dark theme
    const html = page.locator('html');
    const initialIsDark = await html.evaluate((el) => el.classList.contains('dark'));
    
    if (!initialIsDark) {
      await page.getByRole('button', { name: STRINGS.THEME.TOGGLE_LABEL }).click();
    }
    
    // Reload page
    await page.reload();
    
    // Theme should persist
    const isStillDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isStillDark).toBe(true);
  });
});

test.describe('Sidebar', () => {
  test('can collapse and expand sidebar', async ({ page, isMobile }) => {
    // Skip on mobile as sidebar behavior is different
    test.skip(isMobile, 'Sidebar collapse test is for desktop only');
    
    await page.goto(ROUTES.HOME);
    
    // Find and click sidebar toggle
    const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
    await sidebarTrigger.click();
    
    // Sidebar should be collapsed
    const sidebar = page.locator('[data-slot="sidebar"]');
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    
    // Click again to expand
    await sidebarTrigger.click();
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  });
});

test.describe('Responsive Design', () => {
  test('shows mobile menu on small screens', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile menu test is for mobile only');
    
    await page.goto(ROUTES.HOME);
    
    // On mobile, sidebar should be hidden initially
    const sidebar = page.locator('[data-slot="sidebar"][data-mobile="true"]');
    await expect(sidebar).not.toBeVisible();
    
    // Click trigger to open mobile menu
    const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
    await sidebarTrigger.click();
    
    // Mobile sidebar should now be visible
    await expect(sidebar).toBeVisible();
  });
});

test.describe('404 Page', () => {
  test('displays 404 page for unknown routes', async ({ page }) => {
    await page.goto('/some-unknown-route');
    
    // Should show animated 404 text
    await expect(page.getByText(NOT_FOUND_STRINGS.ERROR_CODE).first()).toBeVisible();
  });

  test('displays page not found message', async ({ page }) => {
    await page.goto('/unknown-page');
    
    // Check for the animated letters
    await expect(page.getByText('P').first()).toBeVisible();
  });

  test('has go home button that navigates to home', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    const goHomeButton = page.getByRole('link', { name: NOT_FOUND_STRINGS.GO_HOME });
    await expect(goHomeButton).toBeVisible();
    
    await goHomeButton.click();
    
    await expect(page).toHaveURL(ROUTES.HOME);
    await expect(page.getByRole('heading', { name: HOME_STRINGS.TITLE })).toBeVisible();
  });

  test('has animated elements', async ({ page }) => {
    await page.goto('/404-test');
    
    // Check for animated 404 digits
    const digits = page.locator('.animate-bounce-letter');
    await expect(digits.first()).toBeVisible();
  });
});

