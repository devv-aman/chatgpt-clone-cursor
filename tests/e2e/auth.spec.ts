import { test, expect } from "@playwright/test";

const ROUTES = {
  CHAT: "/",
  LOGIN: "/login",
  REGISTER: "/register",
};

const AUTH_STRINGS = {
  LOGIN: {
    TITLE: "Welcome back",
    SUBMIT: "Sign in",
    LOADING: "Signing in...",
    REGISTER_LINK: "Sign up",
  },
  REGISTER: {
    TITLE: "Create an account",
    SUBMIT: "Create account",
    LOADING: "Creating account...",
    LOGIN_LINK: "Sign in",
  },
  FIELDS: {
    NAME: "Name",
    EMAIL: "Email",
    PASSWORD: "Password",
    NAME_PLACEHOLDER: "Enter your name",
    EMAIL_PLACEHOLDER: "Enter your email",
    PASSWORD_PLACEHOLDER: "Enter your password",
  },
  VALIDATION: {
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Please enter a valid email address",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
    NAME_REQUIRED: "Name is required",
    PASSWORD_UPPERCASE: "Password must contain at least one uppercase letter",
  },
  ERRORS: {
    LOGIN_FAILED: "Invalid email or password",
    EMAIL_EXISTS: "An account with this email already exists",
  },
};

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
  });

  test("displays login form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: AUTH_STRINGS.LOGIN.TITLE })
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER)
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: AUTH_STRINGS.LOGIN.SUBMIT })
    ).toBeVisible();
  });

  test("shows validation errors for empty form submission", async ({
    page,
  }) => {
    await page.getByRole("button", { name: AUTH_STRINGS.LOGIN.SUBMIT }).click();

    await expect(
      page.getByText(AUTH_STRINGS.VALIDATION.EMAIL_REQUIRED)
    ).toBeVisible();
    await expect(
      page.getByText(AUTH_STRINGS.VALIDATION.PASSWORD_REQUIRED)
    ).toBeVisible();
  });

  test("shows validation error for invalid email", async ({ page }) => {
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
      .fill("invalid-email");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER)
      .fill("password123");

    await page.getByRole("button", { name: AUTH_STRINGS.LOGIN.SUBMIT }).click();

    await expect(
      page.getByText(AUTH_STRINGS.VALIDATION.EMAIL_INVALID)
    ).toBeVisible();
  });

  test("clears validation error when typing", async ({ page }) => {
    await page.getByRole("button", { name: AUTH_STRINGS.LOGIN.SUBMIT }).click();

    await expect(
      page.getByText(AUTH_STRINGS.VALIDATION.EMAIL_REQUIRED)
    ).toBeVisible();

    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
      .fill("t");

    await expect(
      page.getByText(AUTH_STRINGS.VALIDATION.EMAIL_REQUIRED)
    ).not.toBeVisible();
  });

  test("navigates to register page", async ({ page }) => {
    await page
      .getByRole("link", { name: AUTH_STRINGS.LOGIN.REGISTER_LINK })
      .click();

    await expect(page).toHaveURL(ROUTES.REGISTER);
    await expect(
      page.getByRole("heading", { name: AUTH_STRINGS.REGISTER.TITLE })
    ).toBeVisible();
  });
});

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.REGISTER);
  });

  test("displays register form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: AUTH_STRINGS.REGISTER.TITLE })
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(AUTH_STRINGS.FIELDS.NAME_PLACEHOLDER)
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER)
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: AUTH_STRINGS.REGISTER.SUBMIT })
    ).toBeVisible();
  });

  test("shows validation errors for empty form submission", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: AUTH_STRINGS.REGISTER.SUBMIT })
      .click();

    await expect(
      page.getByText(AUTH_STRINGS.VALIDATION.NAME_REQUIRED)
    ).toBeVisible();
    await expect(
      page.getByText(AUTH_STRINGS.VALIDATION.EMAIL_REQUIRED)
    ).toBeVisible();
    await expect(
      page.getByText(AUTH_STRINGS.VALIDATION.PASSWORD_MIN_LENGTH)
    ).toBeVisible();
  });

  test("shows validation error for weak password", async ({ page }) => {
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.NAME_PLACEHOLDER)
      .fill("John Doe");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
      .fill("john@example.com");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER)
      .fill("password1!");

    await page
      .getByRole("button", { name: AUTH_STRINGS.REGISTER.SUBMIT })
      .click();

    await expect(
      page.getByText(AUTH_STRINGS.VALIDATION.PASSWORD_UPPERCASE)
    ).toBeVisible();
  });

  test("navigates to login page", async ({ page }) => {
    await page
      .getByRole("link", { name: AUTH_STRINGS.REGISTER.LOGIN_LINK })
      .click();

    await expect(page).toHaveURL(ROUTES.LOGIN);
    await expect(
      page.getByRole("heading", { name: AUTH_STRINGS.LOGIN.TITLE })
    ).toBeVisible();
  });
});

test.describe("Route Protection", () => {
  test("redirects to login when accessing protected route", async ({
    page,
  }) => {
    await page.goto(ROUTES.CHAT);

    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(ROUTES.LOGIN);
    await expect(
      page.getByRole("heading", { name: AUTH_STRINGS.LOGIN.TITLE })
    ).toBeVisible();
  });

  test("redirects to login when accessing settings route", async ({ page }) => {
    await page.goto("/settings");

    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });
});

test.describe("Auth Flow with Mock API", () => {
  test("shows loading state during form submission", async ({ page }) => {
    // Mock the login API to delay response
    await page.route("**/api/v1/auth/login", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Invalid credentials",
          code: "AUTH_1001",
        }),
      });
    });

    await page.goto(ROUTES.LOGIN);

    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
      .fill("test@example.com");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER)
      .fill("password123");

    await page.getByRole("button", { name: AUTH_STRINGS.LOGIN.SUBMIT }).click();

    // Check for loading state
    await expect(
      page.getByRole("button", { name: AUTH_STRINGS.LOGIN.LOADING })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: AUTH_STRINGS.LOGIN.LOADING })
    ).toBeDisabled();

    // Wait for loading to complete
    await expect(
      page.getByRole("button", { name: AUTH_STRINGS.LOGIN.SUBMIT })
    ).toBeVisible();
  });

  test("shows error message on failed login", async ({ page }) => {
    // Mock failed login
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Invalid email or password",
          code: "AUTH_1001",
        }),
      });
    });

    await page.goto(ROUTES.LOGIN);

    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
      .fill("test@example.com");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER)
      .fill("wrongpassword");

    await page.getByRole("button", { name: AUTH_STRINGS.LOGIN.SUBMIT }).click();

    await expect(
      page.getByText(AUTH_STRINGS.ERRORS.LOGIN_FAILED)
    ).toBeVisible();
  });

  test("shows error message when email already exists during registration", async ({
    page,
  }) => {
    // Mock registration failure
    await page.route("**/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "An account with this email already exists",
          code: "AUTH_1005",
        }),
      });
    });

    await page.goto(ROUTES.REGISTER);

    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.NAME_PLACEHOLDER)
      .fill("John Doe");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
      .fill("existing@example.com");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER)
      .fill("SecurePass1!");

    await page
      .getByRole("button", { name: AUTH_STRINGS.REGISTER.SUBMIT })
      .click();

    await expect(
      page.getByText(AUTH_STRINGS.ERRORS.EMAIL_EXISTS)
    ).toBeVisible();
  });

  test("successful login redirects to chat", async ({ page }) => {
    // Mock successful me check (for after login)
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    });

    // Mock successful login
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    });

    // Mock chat list for after redirect
    await page.route("**/api/v1/chats**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { chats: [], total: 0 },
        }),
      });
    });

    await page.goto(ROUTES.LOGIN);

    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
      .fill("test@example.com");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER)
      .fill("password123");

    await page.getByRole("button", { name: AUTH_STRINGS.LOGIN.SUBMIT }).click();

    // Should redirect to chat
    await expect(page).toHaveURL(ROUTES.CHAT);
    await expect(page.getByPlaceholder("Ask anything...")).toBeVisible();
  });

  test("successful registration redirects to chat", async ({ page }) => {
    // Mock successful me check (for after register)
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: "1",
              name: "John Doe",
              email: "john@example.com",
              role: "user",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        }),
      });
    });

    // Mock successful registration
    await page.route("**/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    });

    // Mock chat list for after redirect
    await page.route("**/api/v1/chats**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { chats: [], total: 0 },
        }),
      });
    });

    await page.goto(ROUTES.REGISTER);

    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.NAME_PLACEHOLDER)
      .fill("John Doe");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER)
      .fill("john@example.com");
    await page
      .getByPlaceholder(AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER)
      .fill("SecurePass1!");

    await page
      .getByRole("button", { name: AUTH_STRINGS.REGISTER.SUBMIT })
      .click();

    // Should redirect to chat
    await expect(page).toHaveURL(ROUTES.CHAT);
    await expect(page.getByPlaceholder("Ask anything...")).toBeVisible();
  });

  test("authenticated user is redirected from login to chat", async ({
    page,
  }) => {
    // Mock successful me check
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    });

    // Mock chat list
    await page.route("**/api/v1/chats**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { chats: [], total: 0 },
        }),
      });
    });

    await page.goto(ROUTES.LOGIN);

    // Should redirect to chat since already authenticated
    await expect(page).toHaveURL(ROUTES.CHAT);
  });
});

test.describe("Responsive Design", () => {
  test("login form is responsive on mobile", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only test");

    await page.goto(ROUTES.LOGIN);

    // Form should be visible and usable on mobile
    await expect(
      page.getByRole("heading", { name: AUTH_STRINGS.LOGIN.TITLE })
    ).toBeVisible();

    const form = page.locator("form");
    const formBox = await form.boundingBox();
    expect(formBox?.width).toBeLessThan(500); // Should fit mobile screen
  });
});
