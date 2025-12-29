import crypto from 'crypto';
import { getSupabaseAdminClient } from '../../db/client.js';
import { config } from '../../config/index.js';
import { InternalServerError, BadRequestError } from '../../utils/errors.js';
import { ERROR_MESSAGES } from '../../constants/errors.js';
import { logger } from '../../utils/logger.js';
import { SETTINGS_CONSTANTS } from './settings.constants.js';
import type { SaveOpenAIKeyInput, OpenAIKeyStatusResponse } from './settings.schema.js';

interface EncryptedData {
  encrypted: Buffer;
  iv: Buffer;
  tag: Buffer;
}

const getEncryptionKey = (): Buffer => {
  // Use first 32 bytes of the encryption key for AES-256
  return Buffer.from(config.ENCRYPTION_KEY.slice(0, 32), 'utf-8');
};

const encrypt = (text: string): EncryptedData => {
  const iv = crypto.randomBytes(SETTINGS_CONSTANTS.ENCRYPTION.IV_LENGTH);
  const key = getEncryptionKey();
  
  const cipher = crypto.createCipheriv(
    SETTINGS_CONSTANTS.ENCRYPTION.ALGORITHM,
    key,
    iv
  );
  
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  
  const tag = cipher.getAuthTag();
  
  return { encrypted, iv, tag };
};

const decrypt = (encrypted: Buffer, iv: Buffer, tag: Buffer): string => {
  const key = getEncryptionKey();
  
  const decipher = crypto.createDecipheriv(
    SETTINGS_CONSTANTS.ENCRYPTION.ALGORITHM,
    key,
    iv
  );
  
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  
  return decrypted.toString('utf8');
};

export const saveOpenAIKey = async (
  userId: string,
  input: SaveOpenAIKeyInput
): Promise<void> => {
  const adminClient = getSupabaseAdminClient();
  
  try {
    const { encrypted, iv, tag } = encrypt(input.apiKey);
    
    // Upsert the settings record
    const { error } = await adminClient
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          openai_api_key_encrypted: encrypted.toString('base64'),
          openai_api_key_iv: iv.toString('base64'),
          openai_api_key_tag: tag.toString('base64'),
        },
        { onConflict: 'user_id' }
      );
    
    if (error) {
      logger.error({ error, userId }, 'Failed to save OpenAI API key');
      throw new InternalServerError(ERROR_MESSAGES.SETTINGS.OPENAI_KEY_SAVE_FAILED);
    }
  } catch (error) {
    if (error instanceof InternalServerError) {
      throw error;
    }
    logger.error({ error, userId }, 'Encryption error while saving OpenAI API key');
    throw new InternalServerError(ERROR_MESSAGES.SETTINGS.OPENAI_KEY_SAVE_FAILED);
  }
};

export const getOpenAIKey = async (userId: string): Promise<string | null> => {
  const adminClient = getSupabaseAdminClient();
  
  const { data, error } = await adminClient
    .from('user_settings')
    .select('openai_api_key_encrypted, openai_api_key_iv, openai_api_key_tag')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  if (!data.openai_api_key_encrypted || !data.openai_api_key_iv || !data.openai_api_key_tag) {
    return null;
  }
  
  try {
    const encrypted = Buffer.from(data.openai_api_key_encrypted as string, 'base64');
    const iv = Buffer.from(data.openai_api_key_iv as string, 'base64');
    const tag = Buffer.from(data.openai_api_key_tag as string, 'base64');
    
    return decrypt(encrypted, iv, tag);
  } catch (error) {
    logger.error({ error, userId }, 'Failed to decrypt OpenAI API key');
    throw new InternalServerError(ERROR_MESSAGES.SETTINGS.OPENAI_KEY_DECRYPT_FAILED);
  }
};

export const hasOpenAIKey = async (userId: string): Promise<OpenAIKeyStatusResponse> => {
  const adminClient = getSupabaseAdminClient();
  
  const { data, error } = await adminClient
    .from('user_settings')
    .select('openai_api_key_encrypted')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    return { hasKey: false };
  }
  
  return { hasKey: !!data.openai_api_key_encrypted };
};

export const deleteOpenAIKey = async (userId: string): Promise<void> => {
  const adminClient = getSupabaseAdminClient();
  
  const { error } = await adminClient
    .from('user_settings')
    .update({
      openai_api_key_encrypted: null,
      openai_api_key_iv: null,
      openai_api_key_tag: null,
    })
    .eq('user_id', userId);
  
  if (error) {
    logger.error({ error, userId }, 'Failed to delete OpenAI API key');
    throw new InternalServerError(ERROR_MESSAGES.SETTINGS.OPENAI_KEY_SAVE_FAILED);
  }
};

export const requireOpenAIKey = async (userId: string): Promise<string> => {
  const apiKey = await getOpenAIKey(userId);
  
  if (!apiKey) {
    throw new BadRequestError(ERROR_MESSAGES.SETTINGS.OPENAI_KEY_REQUIRED);
  }
  
  return apiKey;
};

export const settingsService = {
  saveOpenAIKey,
  getOpenAIKey,
  hasOpenAIKey,
  deleteOpenAIKey,
  requireOpenAIKey,
};

