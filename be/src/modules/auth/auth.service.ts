import { getSupabaseClient, getSupabaseAdminClient } from '../../db/client.js';
import type { Profile } from '../../db/types.js';
import { ConflictError, UnauthorizedError, InternalServerError } from '../../utils/errors.js';
import { ERROR_MESSAGES, ERROR_CODES } from '../../constants/index.js';
import { USER_ROLES } from '../../constants/strings.js';
import { logger } from '../../utils/logger.js';
import type { RegisterInput, LoginInput, AuthResponse, UserResponse, RegisterResponse } from './auth.schema.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const mapProfileToUserResponse = (profile: Profile): UserResponse => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  role: profile.role,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
});

export const register = async (input: RegisterInput): Promise<RegisterResponse> => {
  const supabase = getSupabaseClient();
  const adminClient = getSupabaseAdminClient();

  // Check if user already exists
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', input.email)
    .single();

  if (existingProfile) {
    throw new ConflictError(ERROR_MESSAGES.AUTH.EMAIL_EXISTS);
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
      },
    },
  });

  if (authError) {
    logger.error({ error: authError }, 'Failed to create user in Supabase Auth');
    
    if (authError.message.includes('already registered')) {
      throw new ConflictError(ERROR_MESSAGES.AUTH.EMAIL_EXISTS);
    }
    
    throw new InternalServerError(ERROR_MESSAGES.AUTH.REGISTRATION_FAILED);
  }

  if (!authData.user) {
    throw new InternalServerError(ERROR_MESSAGES.AUTH.REGISTRATION_FAILED);
  }

  // Check if email confirmation is required (no session returned)
  const confirmationRequired = !authData.session;

  // The trigger should have created the profile, but let's verify
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    logger.info({ userId: authData.user.id }, 'Profile not created by trigger, creating manually');
    
    // Create profile manually if trigger failed
    const profileData = {
      id: authData.user.id,
      name: input.name,
      email: input.email,
      role: USER_ROLES.USER,
    };
    const { data: newProfile, error: createError } = await adminClient
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (createError || !newProfile) {
      logger.error({ error: createError }, 'Failed to create profile manually');
      throw new InternalServerError(ERROR_MESSAGES.AUTH.REGISTRATION_FAILED);
    }

    return {
      user: mapProfileToUserResponse(newProfile),
      accessToken: authData.session?.access_token,
      refreshToken: authData.session?.refresh_token,
      confirmationRequired,
    };
  }

  return {
    user: mapProfileToUserResponse(profile),
    accessToken: authData.session?.access_token,
    refreshToken: authData.session?.refresh_token,
    confirmationRequired,
  };
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const supabase = getSupabaseClient();
  const adminClient = getSupabaseAdminClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (authError) {
    logger.warn({ error: authError, email: input.email }, 'Login failed');
    throw new UnauthorizedError(
      ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  if (!authData.user || !authData.session) {
    throw new UnauthorizedError(
      ERROR_MESSAGES.AUTH.LOGIN_FAILED,
      ERROR_CODES.UNAUTHORIZED
    );
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .is('deleted_at', null)
    .single();

  if (profileError || !profile) {
    logger.error({ error: profileError, userId: authData.user.id }, 'Profile not found during login');
    throw new UnauthorizedError(
      ERROR_MESSAGES.AUTH.USER_NOT_FOUND,
      ERROR_CODES.UNAUTHORIZED
    );
  }

  return {
    user: mapProfileToUserResponse(profile),
    accessToken: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
  };
};

export const logout = async (accessToken: string): Promise<void> => {
  const adminClient = getSupabaseAdminClient();

  // Use admin client to sign out the user globally
  const { error } = await adminClient.auth.admin.signOut(accessToken, 'global');

  if (error) {
    logger.warn({ error }, 'Logout failed');
    // Don't throw error - just log it, as the token might already be invalid
  }
};

export const getCurrentUser = async (userId: string): Promise<UserResponse> => {
  const adminClient = getSupabaseAdminClient();

  const { data: profile, error } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .single();

  if (error || !profile) {
    logger.error({ error, userId }, 'Failed to fetch user profile');
    throw new UnauthorizedError(
      ERROR_MESSAGES.AUTH.USER_NOT_FOUND,
      ERROR_CODES.UNAUTHORIZED
    );
  }

  return mapProfileToUserResponse(profile);
};

export const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

