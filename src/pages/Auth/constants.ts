export const AUTH_STRINGS = {
  LOGIN: {
    TITLE: "Welcome back",
    SUBTITLE: "Sign in to your account to continue",
    SUBMIT: "Sign in",
    LOADING: "Signing in...",
    NO_ACCOUNT: "Don't have an account?",
    REGISTER_LINK: "Sign up",
  },
  REGISTER: {
    TITLE: "Create an account",
    SUBTITLE: "Get started with your free account",
    SUBMIT: "Create account",
    LOADING: "Creating account...",
    HAS_ACCOUNT: "Already have an account?",
    LOGIN_LINK: "Sign in",
    CONFIRMATION_MESSAGE:
      "Please check your email to confirm your account before logging in.",
  },
  FIELDS: {
    NAME: "Name",
    NAME_PLACEHOLDER: "Enter your name",
    EMAIL: "Email",
    EMAIL_PLACEHOLDER: "Enter your email",
    PASSWORD: "Password",
    PASSWORD_PLACEHOLDER: "Enter your password",
  },
  VALIDATION: {
    NAME_REQUIRED: "Name is required",
    NAME_MAX_LENGTH: "Name must be 100 characters or less",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Please enter a valid email address",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
    PASSWORD_MAX_LENGTH: "Password must be 128 characters or less",
    PASSWORD_UPPERCASE: "Password must contain at least one uppercase letter",
    PASSWORD_LOWERCASE: "Password must contain at least one lowercase letter",
    PASSWORD_NUMBER: "Password must contain at least one number",
    PASSWORD_SPECIAL:
      "Password must contain at least one special character (@$!%*?&)",
  },
  ERRORS: {
    LOGIN_FAILED: "Invalid email or password",
    REGISTER_FAILED: "Registration failed. Please try again.",
    EMAIL_EXISTS: "An account with this email already exists",
    GENERIC: "Something went wrong. Please try again.",
  },
} as const;
