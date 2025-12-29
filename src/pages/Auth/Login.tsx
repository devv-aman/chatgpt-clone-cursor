import { useState, useCallback, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/constants/routes";
import { AUTH_STRINGS } from "./constants";
import { loginSchema, type LoginFormData } from "./schema";
import type { ApiError } from "@/api";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = useCallback((): boolean => {
    const result = loginSchema.safeParse(formData);
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

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      try {
        await login(formData);
        navigate(ROUTES.CHAT);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.code === "AUTH_1001") {
          setServerError(AUTH_STRINGS.ERRORS.LOGIN_FAILED);
        } else {
          setServerError(apiError.message || AUTH_STRINGS.ERRORS.GENERIC);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, login, navigate, validateForm]
  );

  const handleInputChange = useCallback(
    (field: keyof LoginFormData) =>
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
            {AUTH_STRINGS.LOGIN.TITLE}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {AUTH_STRINGS.LOGIN.SUBTITLE}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Server Error */}
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

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
              autoComplete="current-password"
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? AUTH_STRINGS.LOGIN.LOADING : AUTH_STRINGS.LOGIN.SUBMIT}
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          {AUTH_STRINGS.LOGIN.NO_ACCOUNT}{" "}
          <Link
            to={ROUTES.REGISTER}
            className="font-medium text-primary hover:underline"
          >
            {AUTH_STRINGS.LOGIN.REGISTER_LINK}
          </Link>
        </p>
      </div>
    </div>
  );
}
