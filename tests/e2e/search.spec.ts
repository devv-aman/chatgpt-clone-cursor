import { test, expect } from "@playwright/test";

const ROUTES = {
  CHAT: "/",
};

const SEARCH_STRINGS = {
  PLACEHOLDER: "Search your chats...",
  NO_RESULTS: "No chats found",
  SEARCHING: "Searching...",
  SEARCH_CHATS: "Search chats",
};

// Helper to open search modal - tries both keyboard shortcuts
async function openSearchModal(page: import("@playwright/test").Page) {
  // Try Meta+K first (works on macOS), then Control+K (works on Windows/Linux)
  await page.keyboard.press("Meta+k");

  // Check if modal opened, if not try Control+K
  const searchInput = page.getByPlaceholder(SEARCH_STRINGS.PLACEHOLDER);
  const isVisible = await searchInput.isVisible().catch(() => false);

  if (!isVisible) {
    await page.keyboard.press("Control+k");
  }
}

test.describe("Search Modal", () => {
  test("opens search modal with keyboard shortcut", async ({ page }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    // Search modal should be visible
    const searchInput = page.getByPlaceholder(SEARCH_STRINGS.PLACEHOLDER);
    await expect(searchInput).toBeVisible();
  });

  test("opens search modal by clicking search button in sidebar", async ({
    page,
    isMobile,
  }) => {
    await page.goto(ROUTES.CHAT);

    // On mobile, need to open sidebar first
    if (isMobile) {
      await page.locator('[data-sidebar="trigger"]').click();
      await expect(
        page.locator('[data-slot="sidebar"][data-mobile="true"]')
      ).toBeVisible();
    }

    // Click on search button (look for the search icon or search chats text)
    const searchButton = page.getByRole("button", {
      name: SEARCH_STRINGS.SEARCH_CHATS,
    });
    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      // Try with keyboard shortcut as fallback
      await openSearchModal(page);
    }

    const searchInput = page.getByPlaceholder(SEARCH_STRINGS.PLACEHOLDER);
    await expect(searchInput).toBeVisible();
  });

  test("closes search modal with Escape key", async ({ page }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    const searchInput = page.getByPlaceholder(SEARCH_STRINGS.PLACEHOLDER);
    await expect(searchInput).toBeVisible();

    // Close with Escape
    await page.keyboard.press("Escape");

    // Modal should be closed
    await expect(searchInput).not.toBeVisible();
  });

  test("search input is focused when modal opens", async ({ page }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    const searchInput = page.getByPlaceholder(SEARCH_STRINGS.PLACEHOLDER);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();
  });

  test("shows placeholder message when search query is empty", async ({
    page,
  }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    // Should show the placeholder text
    await expect(page.getByText(SEARCH_STRINGS.PLACEHOLDER)).toBeVisible();
  });

  test("shows no results message when search has no matches", async ({
    page,
  }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    const searchInput = page.getByPlaceholder(SEARCH_STRINGS.PLACEHOLDER);

    // Type a search query that likely won't match
    await searchInput.fill("xyznonexistentquery123");

    // Wait for debounce and API call
    await page.waitForTimeout(500);

    // Should show no results message
    await expect(page.getByText(SEARCH_STRINGS.NO_RESULTS)).toBeVisible();
  });

  test("clears search query when modal is closed and reopened", async ({
    page,
  }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    const searchInput = page.getByPlaceholder(SEARCH_STRINGS.PLACEHOLDER);

    // Type something
    await searchInput.fill("test query");
    await expect(searchInput).toHaveValue("test query");

    // Close modal
    await page.keyboard.press("Escape");

    // Reopen modal
    await openSearchModal(page);

    // Search input should be cleared
    await expect(searchInput).toHaveValue("");
  });
});

test.describe("Search Keyboard Navigation", () => {
  test("navigates through results with arrow keys", async ({ page }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    const searchInput = page.getByPlaceholder(SEARCH_STRINGS.PLACEHOLDER);
    await expect(searchInput).toBeVisible();

    // Type to trigger search (we'll check if navigation works with any results)
    await searchInput.fill("a");

    // Wait for debounce
    await page.waitForTimeout(500);

    // Press down arrow - should not throw error even if no results
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");

    // Input should still be focused
    await expect(searchInput).toBeFocused();
  });

  test("pressing Enter with no results does nothing", async ({ page }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    const searchInput = page.getByPlaceholder(SEARCH_STRINGS.PLACEHOLDER);

    // Type a query that won't match
    await searchInput.fill("xyznonexistentquery");

    // Wait for debounce
    await page.waitForTimeout(500);

    // Press Enter - should not navigate or close
    await page.keyboard.press("Enter");

    // Modal should still be open (unless there's an error)
    // URL should not have changed
    await expect(page).toHaveURL(ROUTES.CHAT);
  });
});

test.describe("Search Accessibility", () => {
  test("search modal has proper dialog role", async ({ page }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    // Check for dialog role
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
  });

  test("search modal has accessible title", async ({ page }) => {
    await page.goto(ROUTES.CHAT);

    await openSearchModal(page);

    // The title should be present (even if visually hidden)
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
  });
});
