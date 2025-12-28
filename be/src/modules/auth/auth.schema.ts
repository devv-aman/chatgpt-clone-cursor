import { z } from 'zod';
import { AUTH_CONSTANTS } from './auth.constants.js';
import { ERROR_MESSAGES } from '../../constants/errors.js';
import { USER_ROLES } from '../../constants/strings.js';

export const registerSchema = z.object({
  name: z
    .string()
    .min(AUTH_CONSTANTS.MIN_NAME_LENGTH, ERROR_MESSAGES.VALIDATION.NAME_REQUIRED)
    .max(AUTH_CONSTANTS.MAX_NAME_LENGTH),
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  password: z
    .string()
    .min(AUTH_CONSTANTS.MIN_PASSWORD_LENGTH, ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT)
    .max(AUTH_CONSTANTS.MAX_PASSWORD_LENGTH)
    .regex(AUTH_CONSTANTS.PASSWORD_REGEX, ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_WEAK),
});

export const loginSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(AUTH_CONSTANTS.MIN_NAME_LENGTH, ERROR_MESSAGES.VALIDATION.NAME_REQUIRED)
    .max(AUTH_CONSTANTS.MAX_NAME_LENGTH)
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Response types
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum([USER_ROLES.USER, USER_ROLES.ADMIN]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

export const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Register response - tokens are optional when email confirmation is required
export interface RegisterResponse {
  user: UserResponse;
  accessToken: string | undefined;
  refreshToken: string | undefined;
  confirmationRequired: boolean;
}

