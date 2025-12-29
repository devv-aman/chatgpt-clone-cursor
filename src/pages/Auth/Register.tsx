import { useState, useCallback, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/constants/routes";
import { AUTH_STRINGS } from "./constants";
import { registerSchema, type RegisterFormData } from "./schema";
import type { ApiError } from "@/api";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = useCallback((): boolean => {
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setServerError(null);
      setSuccessMessage(null);

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await register(formData);
        if (result.confirmationRequired) {
          setSuccessMessage(AUTH_STRINGS.REGISTER.CONFIRMATION_MESSAGE);
        } else {
          navigate(ROUTES.CHAT);
        }
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.code === "AUTH_1005") {
          setServerError(AUTH_STRINGS.ERRORS.EMAIL_EXISTS);
        } else {
          setServerError(
            apiError.message || AUTH_STRINGS.ERRORS.REGISTER_FAILED
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, register, navigate, validateForm]
  );

  const handleInputChange = useCallback(
    (field: keyof RegisterFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        // Clear field error on change
        if (errors[field]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        if (serverError) {
          setServerError(null);
        }
      },
    [errors, serverError]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {AUTH_STRINGS.REGISTER.TITLE}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {AUTH_STRINGS.REGISTER.SUBTITLE}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
              {successMessage}
            </div>
          )}

          {/* Server Error */}
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">{AUTH_STRINGS.FIELDS.NAME}</Label>
            <Input
              id="name"
              type="text"
              placeholder={AUTH_STRINGS.FIELDS.NAME_PLACEHOLDER}
              value={formData.name}
              onChange={handleInputChange("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              autoComplete="name"
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{AUTH_STRINGS.FIELDS.EMAIL}</Label>
            <Input
              id="email"
              type="email"
              placeholder={AUTH_STRINGS.FIELDS.EMAIL_PLACEHOLDER}
              value={formData.email}
              onChange={handleInputChange("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              autoComplete="email"
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">{AUTH_STRINGS.FIELDS.PASSWORD}</Label>
            <Input
              id="password"
              type="password"
              placeholder={AUTH_STRINGS.FIELDS.PASSWORD_PLACEHOLDER}
              value={formData.password}
              onChange={handleInputChange("password")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              autoComplete="new-password"
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !!successMessage}
          >
            {isLoading
              ? AUTH_STRINGS.REGISTER.LOADING
              : AUTH_STRINGS.REGISTER.SUBMIT}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground">
          {AUTH_STRINGS.REGISTER.HAS_ACCOUNT}{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-medium text-primary hover:underline"
          >
            {AUTH_STRINGS.REGISTER.LOGIN_LINK}
          </Link>
        </p>
      </div>
    </div>
  );
}
