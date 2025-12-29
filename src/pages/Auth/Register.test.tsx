import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { Register } from "./Register";
import { AUTH_STRINGS } from "./constants";

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the register form", () => {
    render(<Register />);

    expect(
      screen.getByRole("heading", { name: AUTH_STRINGS.REGISTER.TITLE })
    ).toBeInTheDocument();
    expect(
      screen.getByText(AUTH_STRINGS.REGISTER.SUBTITLE)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_STRINGS.FIELDS.NAME)).toBeInTheDocument();
    expect(
      screen.getByLabelText(AUTH_STRINGS.FIELDS.EMAIL)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(AUTH_STRINGS.FIELDS.PASSWORD)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: AUTH_STRINGS.REGISTER.SUBMIT })
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const submitButton = screen.getByRole("button", {
      name: AUTH_STRINGS.REGISTER.SUBMIT,
    });
    await user.click(submitButton);

    expect(
      screen.getByText(AUTH_STRINGS.VALIDATION.NAME_REQUIRED)
    ).toBeInTheDocument();
    expect(
      screen.getByText(AUTH_STRINGS.VALIDATION.EMAIL_REQUIRED)
    ).toBeInTheDocument();
    expect(
      screen.getByText(AUTH_STRINGS.VALIDATION.PASSWORD_MIN_LENGTH)
    ).toBeInTheDocument();
  });

  it("shows validation error for weak password", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const nameInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.NAME);
    const emailInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.EMAIL);
    const passwordInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.PASSWORD);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "weak");

    const submitButton = screen.getByRole("button", {
      name: AUTH_STRINGS.REGISTER.SUBMIT,
    });
    await user.click(submitButton);

    // Should show min length error
    expect(
      screen.getByText(AUTH_STRINGS.VALIDATION.PASSWORD_MIN_LENGTH)
    ).toBeInTheDocument();
  });

  it("shows validation error for password without uppercase", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const nameInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.NAME);
    const emailInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.EMAIL);
    const passwordInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.PASSWORD);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password1!");

    const submitButton = screen.getByRole("button", {
      name: AUTH_STRINGS.REGISTER.SUBMIT,
    });
    await user.click(submitButton);

    expect(
      screen.getByText(AUTH_STRINGS.VALIDATION.PASSWORD_UPPERCASE)
    ).toBeInTheDocument();
  });

  it("calls register function on valid form submission", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ confirmationRequired: false });

    render(<Register />, {
      authValue: { register: mockRegister },
    });

    const nameInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.NAME);
    const emailInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.EMAIL);
    const passwordInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.PASSWORD);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "SecurePass1!");

    const submitButton = screen.getByRole("button", {
      name: AUTH_STRINGS.REGISTER.SUBMIT,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass1!",
      });
    });
  });

  it("shows confirmation message when email confirmation is required", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ confirmationRequired: true });

    render(<Register />, {
      authValue: { register: mockRegister },
    });

    const nameInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.NAME);
    const emailInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.EMAIL);
    const passwordInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.PASSWORD);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "SecurePass1!");

    const submitButton = screen.getByRole("button", {
      name: AUTH_STRINGS.REGISTER.SUBMIT,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(AUTH_STRINGS.REGISTER.CONFIRMATION_MESSAGE)
      ).toBeInTheDocument();
    });

    // Submit button should be disabled
    expect(submitButton).toBeDisabled();
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<Register />, {
      authValue: { register: mockRegister },
    });

    const nameInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.NAME);
    const emailInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.EMAIL);
    const passwordInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.PASSWORD);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "SecurePass1!");

    const submitButton = screen.getByRole("button", {
      name: AUTH_STRINGS.REGISTER.SUBMIT,
    });
    await user.click(submitButton);

    expect(
      screen.getByRole("button", { name: AUTH_STRINGS.REGISTER.LOADING })
    ).toBeDisabled();
  });

  it("shows server error when email already exists", async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValue({
      code: "AUTH_1005",
      message: "Email exists",
    });

    render(<Register />, {
      authValue: { register: mockRegister },
    });

    const nameInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.NAME);
    const emailInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.EMAIL);
    const passwordInput = screen.getByLabelText(AUTH_STRINGS.FIELDS.PASSWORD);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "SecurePass1!");

    const submitButton = screen.getByRole("button", {
      name: AUTH_STRINGS.REGISTER.SUBMIT,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(AUTH_STRINGS.ERRORS.EMAIL_EXISTS)
      ).toBeInTheDocument();
    });
  });

  it("has link to login page", () => {
    render(<Register />);

    const loginLink = screen.getByRole("link", {
      name: AUTH_STRINGS.REGISTER.LOGIN_LINK,
    });
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
