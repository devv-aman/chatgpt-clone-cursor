-- ============================================
-- FIX: Change BYTEA columns to TEXT for base64 storage
-- ============================================

-- Change column types from BYTEA to TEXT
ALTER TABLE public.user_settings 
  ALTER COLUMN openai_api_key_encrypted TYPE TEXT USING openai_api_key_encrypted::TEXT,
  ALTER COLUMN openai_api_key_iv TYPE TEXT USING openai_api_key_iv::TEXT,
  ALTER COLUMN openai_api_key_tag TYPE TEXT USING openai_api_key_tag::TEXT;

-- Clear any corrupted data from BYTEA to TEXT conversion
UPDATE public.user_settings 
SET openai_api_key_encrypted = NULL, 
    openai_api_key_iv = NULL, 
    openai_api_key_tag = NULL
WHERE openai_api_key_encrypted IS NOT NULL;
