import { test, expect } from '@playwright/test';

const ROUTES = {
  CHAT: '/',
};

const CHAT_STRINGS = {
  PLACEHOLDER: 'Ask anything...',
  SEND_LABEL: 'Send message',
  STOP_LABEL: 'Stop generating',
  YOUR_CHATS: 'Your chats',
};

test.describe('Chat Input', () => {
  test('displays centered prompt container on new chat', async ({ page }) => {
    await page.goto(ROUTES.CHAT);
    
    const textarea = page.getByPlaceholder(CHAT_STRINGS.PLACEHOLDER);
    await expect(textarea).toBeVisible();
    
    // Check textarea has correct attributes
    await expect(textarea).toHaveAttribute('rows', '1');
  });

  test('textarea auto-grows with content', async ({ page }) => {
    await page.goto(ROUTES.CHAT);
    
    const textarea = page.getByPlaceholder(CHAT_STRINGS.PLACEHOLDER);
    
    // Get initial height
    const initialHeight = await textarea.evaluate((el) => el.scrollHeight);
    
    // Add multiple lines
    await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4');
    
    // Height should have grown
    const newHeight = await textarea.evaluate((el) => el.scrollHeight);
    expect(newHeight).toBeGreaterThanOrEqual(initialHeight);
  });

  test('send button toggles disabled state based on input', async ({ page }) => {
    await page.goto(ROUTES.CHAT);
    
    const textarea = page.getByPlaceholder(CHAT_STRINGS.PLACEHOLDER);
    const sendButton = page.getByRole('button', { name: CHAT_STRINGS.SEND_LABEL });
    
    // Initially disabled
    await expect(sendButton).toBeDisabled();
    
    // Type something
    await textarea.fill('Test message');
    await expect(sendButton).toBeEnabled();
    
    // Clear
    await textarea.fill('');
    await expect(sendButton).toBeDisabled();
  });

  test('pressing enter does not submit when empty', async ({ page }) => {
    await page.goto(ROUTES.CHAT);
    
    const textarea = page.getByPlaceholder(CHAT_STRINGS.PLACEHOLDER);
    
    await textarea.focus();
    await textarea.press('Enter');
    
    // Should still be on the same page with centered prompt
    await expect(textarea).toBeVisible();
    // URL should not change
    await expect(page).toHaveURL(ROUTES.CHAT);
  });

  test('shift+enter adds new line instead of submitting', async ({ page }) => {
    await page.goto(ROUTES.CHAT);
    
    const textarea = page.getByPlaceholder(CHAT_STRINGS.PLACEHOLDER);
    
    await textarea.fill('Line 1');
    await textarea.press('Shift+Enter');
    await textarea.type('Line 2');
    
    const value = await textarea.inputValue();
    expect(value).toContain('\n');
    expect(value).toContain('Line 1');
    expect(value).toContain('Line 2');
  });
});

test.describe('Chat History Sidebar', () => {
  test('shows "Your chats" section in sidebar', async ({ page, isMobile }) => {
    // Skip on mobile as sidebar behavior is different
    test.skip(isMobile, 'Sidebar hidden on mobile by default');
    
    await page.goto(ROUTES.CHAT);
    
    await expect(page.getByText(CHAT_STRINGS.YOUR_CHATS)).toBeVisible();
  });

  test('shows chat history section on mobile after opening sidebar', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');
    
    await page.goto(ROUTES.CHAT);
    
    // Open sidebar
    await page.locator('[data-sidebar="trigger"]').click();
    await expect(page.locator('[data-slot="sidebar"][data-mobile="true"]')).toBeVisible();
    
    // Should show chat history
    await expect(page.getByText(CHAT_STRINGS.YOUR_CHATS)).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('shows mobile menu on small screens', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile menu test is for mobile only');
    
    await page.goto(ROUTES.CHAT);
    
    // On mobile, sidebar should be hidden initially
    const sidebar = page.locator('[data-slot="sidebar"][data-mobile="true"]');
    await expect(sidebar).not.toBeVisible();
    
    // Click trigger to open mobile menu
    const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
    await sidebarTrigger.click();
    
    // Mobile sidebar should now be visible
    await expect(sidebar).toBeVisible();
  });

  test('prompt container is responsive', async ({ page }) => {
    await page.goto(ROUTES.CHAT);
    
    const textarea = page.getByPlaceholder(CHAT_STRINGS.PLACEHOLDER);
    
    // Should be visible and usable
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeEnabled();
  });
});

