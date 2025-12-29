import { z } from "zod";
import { AUTH_STRINGS } from "./constants";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, AUTH_STRINGS.VALIDATION.EMAIL_REQUIRED)
    .email(AUTH_STRINGS.VALIDATION.EMAIL_INVALID),
  password: z.string().min(1, AUTH_STRINGS.VALIDATION.PASSWORD_REQUIRED),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, AUTH_STRINGS.VALIDATION.NAME_REQUIRED)
    .max(100, AUTH_STRINGS.VALIDATION.NAME_MAX_LENGTH),
  email: z
    .string()
    .min(1, AUTH_STRINGS.VALIDATION.EMAIL_REQUIRED)
    .email(AUTH_STRINGS.VALIDATION.EMAIL_INVALID),
  password: z
    .string()
    .min(8, AUTH_STRINGS.VALIDATION.PASSWORD_MIN_LENGTH)
    .max(128, AUTH_STRINGS.VALIDATION.PASSWORD_MAX_LENGTH)
    .regex(/[A-Z]/, AUTH_STRINGS.VALIDATION.PASSWORD_UPPERCASE)
    .regex(/[a-z]/, AUTH_STRINGS.VALIDATION.PASSWORD_LOWERCASE)
    .regex(/[0-9]/, AUTH_STRINGS.VALIDATION.PASSWORD_NUMBER)
    .regex(/[@$!%*?&]/, AUTH_STRINGS.VALIDATION.PASSWORD_SPECIAL),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
