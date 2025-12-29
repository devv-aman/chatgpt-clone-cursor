import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { MainLayout } from "@/components/layout";
import { Chat } from "@/pages/Chat";
import { Settings } from "@/pages/Settings";
import { ROUTES } from "@/constants/routes";
import { STRINGS } from "@/constants/strings";
import { CHAT_STRINGS } from "@/pages/Chat/constants";
import { SETTINGS_STRINGS } from "@/pages/Settings/constants";

// Mock the chat API
vi.mock("@/api", () => ({
  chatApi: {
    getChats: vi
      .fn()
      .mockResolvedValue({ success: true, data: { chats: [], total: 0 } }),
    getChatMessages: vi
      .fn()
      .mockResolvedValue({ success: true, data: { messages: [], total: 0 } }),
    startStream: vi.fn(),
    stopStream: vi.fn(),
  },
  tokenStorage: {
    getAccessToken: vi.fn().mockReturnValue(null),
    getRefreshToken: vi.fn().mockReturnValue(null),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    loadFromStorage: vi.fn(),
  },
  apiClient: {},
}));

function renderWithRouter(initialRoute: string = ROUTES.CHAT) {
  const router = createMemoryRouter(
    [
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
    { initialEntries: [initialRoute] }
  );

  return render(
    <ThemeProvider defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

describe("Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the chat page by default", () => {
    renderWithRouter();

    expect(
      screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER)
    ).toBeInTheDocument();
  });

  it("navigates to settings page when clicking settings link", async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // Find the Settings link directly
    const settingsLink = screen.getByRole("link", {
      name: STRINGS.NAVIGATION.SETTINGS,
    });

    await user.click(settingsLink);

    // Use heading role to avoid matching sidebar text
    expect(
      screen.getByRole("heading", { name: SETTINGS_STRINGS.TITLE })
    ).toBeInTheDocument();
  });

  it("navigates back to chat page when clicking new chat link", async () => {
    const user = userEvent.setup();
    renderWithRouter(ROUTES.SETTINGS);

    // Find the New Chat link
    const newChatLinks = screen.getAllByRole("link", {
      name: STRINGS.CHAT.NEW_CHAT,
    });
    const newChatLink = newChatLinks[0];

    await user.click(newChatLink);

    expect(
      screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER)
    ).toBeInTheDocument();
  });

  it("shows active state on current navigation item", () => {
    renderWithRouter();

    // Find the New Chat navigation link
    const chatLinks = screen.getAllByRole("link", {
      name: STRINGS.CHAT.NEW_CHAT,
    });
    const chatLink = chatLinks[0];

    // The link should have data-active attribute
    expect(chatLink).toHaveAttribute("data-active", "true");
  });
});

describe("Theme Toggle Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark", "light");
  });

  it("toggles between light and dark theme", async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const themeButton = screen.getByRole("button", {
      name: STRINGS.THEME.TOGGLE_LABEL,
    });

    // Initially should be light (based on mock)
    expect(themeButton).toBeInTheDocument();

    await user.click(themeButton);

    // After click, theme class should be added to document
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists theme preference", async () => {
    const user = userEvent.setup();

    renderWithRouter();

    const themeButton = screen.getByRole("button", {
      name: STRINGS.THEME.TOGGLE_LABEL,
    });

    await user.click(themeButton);

    // Check localStorage was called (our mock tracks calls)
    // Theme toggle stores the new theme value
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "theme",
      expect.any(String)
    );
  });
});
