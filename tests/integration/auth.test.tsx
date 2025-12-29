import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { MainLayout, ProtectedRoute } from "@/components/layout";
import { Login, Register, AuthLayout } from "@/pages/Auth";
import { Chat } from "@/pages/Chat";
import { ROUTES } from "@/constants/routes";
import { AUTH_STRINGS } from "@/pages/Auth/constants";
import { authApi, tokenStorage } from "@/api";

// Create a mock token store that simulates real behavior
let mockAccessToken: string | null = null;
let mockRefreshToken: string | null = null;

// Mock the APIs
vi.mock("@/api", () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
  tokenStorage: {
    getAccessToken: vi.fn(() => mockAccessToken),
    getRefreshToken: vi.fn(() => mockRefreshToken),
    setTokens: vi.fn((access: string | null, refresh: string | null) => {
      mockAccessToken = access;
      mockRefreshToken = refresh;
    }),
    clearTokens: vi.fn(() => {
      mockAccessToken = null;
      mockRefreshToken = null;
    }),
    loadFromStorage: vi.fn(),
  },
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
  apiClient: {},
}));

const mockAuthApi = vi.mocked(authApi);
const mockTokenStorage = vi.mocked(tokenStorage);

function renderWithRouter(initialRoute: string = ROUTES.LOGIN) {
  const router = createMemoryRouter(
    [
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
            ],
          },
        ],
      },
    ],
    { initialEntries: [initialRoute] }
  );

  return render(
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe("Auth Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock token state
    mockTokenStorage.clearTokens();
  });

  describe("Route Protection", () => {
    it("redirects to login when accessing protected route while not authenticated", async () => {
      mockAuthApi.me.mockRejectedValue(new Error("Unauthorized"));

      renderWithRouter(ROUTES.CHAT);

      // Should redirect to login
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: AUTH_STRINGS.LOGIN.TITLE })
        ).toBeInTheDocument();
      });
    });

    it("shows protected content when authenticated", async () => {
      // Set up tokens to simulate authenticated user
      mockTokenStorage.setTokens("mock-access-token", "mock-refresh-token");

      mockAuthApi.me.mockResolvedValue({
        success: true,
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            role: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      });

      renderWithRouter(ROUTES.CHAT);

      // Should show chat page
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Ask anything...")
        ).toBeInTheDocument();
      });
    });

    it("redirects to home when authenticated user accesses login", async () => {
      // Set up tokens to simulate authenticated user
      mockTokenStorage.setTokens("mock-access-token", "mock-refresh-token");

      mockAuthApi.me.mockResolvedValue({
        success: true,
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            role: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      });

      renderWithRouter(ROUTES.LOGIN);

      // Should redirect to chat
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Ask anything...")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Login Flow", () => {
    it("navigates from login to register", async () => {
      mockAuthApi.me.mockRejectedValue(new Error("Unauthorized"));

      const user = userEvent.setup();
      renderWithRouter(ROUTES.LOGIN);

      // Wait for login page
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: AUTH_STRINGS.LOGIN.TITLE })
        ).toBeInTheDocument();
      });

      // Click register link
      const registerLink = screen.getByRole("link", {
        name: AUTH_STRINGS.LOGIN.REGISTER_LINK,
      });
      await user.click(registerLink);

      // Should show register page
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: AUTH_STRINGS.REGISTER.TITLE })
        ).toBeInTheDocument();
      });
    });

    it("redirects to chat after successful login", async () => {
      mockAuthApi.me.mockRejectedValue(new Error("Unauthorized"));
      mockAuthApi.login.mockResolvedValue({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            role: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          accessToken: "token",
          refreshToken: "refresh",
        },
      });

      const user = userEvent.setup();
      renderWithRouter(ROUTES.LOGIN);

      // Wait for login page
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: AUTH_STRINGS.LOGIN.TITLE })
        ).toBeInTheDocument();
      });

      // Fill form
      await user.type(
        screen.getByLabelText(AUTH_STRINGS.FIELDS.EMAIL),
        "test@example.com"
      );
      await user.type(
        screen.getByLabelText(AUTH_STRINGS.FIELDS.PASSWORD),
        "password123"
      );

      // Submit
      await user.click(
        screen.getByRole("button", { name: AUTH_STRINGS.LOGIN.SUBMIT })
      );

      // Should redirect to chat
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Ask anything...")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Register Flow", () => {
    it("navigates from register to login", async () => {
      mockAuthApi.me.mockRejectedValue(new Error("Unauthorized"));

      const user = userEvent.setup();
      renderWithRouter(ROUTES.REGISTER);

      // Wait for register page
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: AUTH_STRINGS.REGISTER.TITLE })
        ).toBeInTheDocument();
      });

      // Click login link
      const loginLink = screen.getByRole("link", {
        name: AUTH_STRINGS.REGISTER.LOGIN_LINK,
      });
      await user.click(loginLink);

      // Should show login page
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: AUTH_STRINGS.LOGIN.TITLE })
        ).toBeInTheDocument();
      });
    });

    it("redirects to chat after successful registration", async () => {
      mockAuthApi.me.mockRejectedValue(new Error("Unauthorized"));
      mockAuthApi.register.mockResolvedValue({
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          accessToken: "token",
          refreshToken: "refresh",
          confirmationRequired: false,
        },
      });

      const user = userEvent.setup();
      renderWithRouter(ROUTES.REGISTER);

      // Wait for register page
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: AUTH_STRINGS.REGISTER.TITLE })
        ).toBeInTheDocument();
      });

      // Fill form
      await user.type(
        screen.getByLabelText(AUTH_STRINGS.FIELDS.NAME),
        "John Doe"
      );
      await user.type(
        screen.getByLabelText(AUTH_STRINGS.FIELDS.EMAIL),
        "john@example.com"
      );
      await user.type(
        screen.getByLabelText(AUTH_STRINGS.FIELDS.PASSWORD),
        "SecurePass1!"
      );

      // Submit
      await user.click(
        screen.getByRole("button", { name: AUTH_STRINGS.REGISTER.SUBMIT })
      );

      // Should redirect to chat
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Ask anything...")
        ).toBeInTheDocument();
      });
    });
  });
});
