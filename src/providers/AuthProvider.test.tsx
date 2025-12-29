import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthProvider";
import { authApi } from "@/api";

// Mock the authApi and tokenStorage
vi.mock("@/api", () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
  tokenStorage: {
    getAccessToken: vi.fn().mockReturnValue("mock-token"),
    getRefreshToken: vi.fn().mockReturnValue("mock-refresh"),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    loadFromStorage: vi.fn(),
  },
}));

const mockAuthApi = vi.mocked(authApi);

// Test component to access auth context
function TestConsumer() {
  const { user, isLoading, isAuthenticated, login, register, logout } =
    useAuth();

  return (
    <div>
      <span data-testid="loading">{isLoading.toString()}</span>
      <span data-testid="authenticated">{isAuthenticated.toString()}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
      <button
        onClick={() =>
          login({ email: "test@example.com", password: "password" })
        }
      >
        Login
      </button>
      <button
        onClick={() =>
          register({
            name: "Test",
            email: "test@example.com",
            password: "password",
          })
        }
      >
        Register
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks authentication on mount", async () => {
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

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    // After auth check completes
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
  });

  it("sets user to null when not authenticated", async () => {
    mockAuthApi.me.mockRejectedValue(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  it("logs in user and updates state", async () => {
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

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Click login button
    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
  });

  it("registers user and updates state", async () => {
    mockAuthApi.me.mockRejectedValue(new Error("Unauthorized"));
    mockAuthApi.register.mockResolvedValue({
      success: true,
      message: "Registration successful",
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
        confirmationRequired: false,
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Click register button
    await act(async () => {
      screen.getByText("Register").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
  });

  it("does not set user when confirmation is required", async () => {
    mockAuthApi.me.mockRejectedValue(new Error("Unauthorized"));
    mockAuthApi.register.mockResolvedValue({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        accessToken: null,
        refreshToken: null,
        confirmationRequired: true,
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Click register button
    await act(async () => {
      screen.getByText("Register").click();
    });

    // User should still be null since confirmation is required
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("logs out user and clears state", async () => {
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
    mockAuthApi.logout.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Wait for auth check
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    // Click logout button
    await act(async () => {
      screen.getByText("Logout").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  it("throws error when useAuth is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });
});
