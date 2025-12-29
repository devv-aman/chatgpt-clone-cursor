import { z } from 'zod';
import { ERROR_MESSAGES } from '../../constants/errors.js';
import { SETTINGS_CONSTANTS } from './settings.constants.js';

export const saveOpenAIKeySchema = z.object({
  apiKey: z
    .string()
    .min(
      SETTINGS_CONSTANTS.OPENAI_KEY.MIN_LENGTH,
      ERROR_MESSAGES.SETTINGS.OPENAI_KEY_INVALID
    )
    .refine(
      (key) => key.startsWith(SETTINGS_CONSTANTS.OPENAI_KEY.PREFIX),
      ERROR_MESSAGES.SETTINGS.OPENAI_KEY_INVALID
    ),
});

export type SaveOpenAIKeyInput = z.infer<typeof saveOpenAIKeySchema>;

export interface OpenAIKeyStatusResponse {
  hasKey: boolean;
}

