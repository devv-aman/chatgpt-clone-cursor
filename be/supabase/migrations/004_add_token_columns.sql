-- ============================================
-- Add Token Usage Columns to Messages Table
-- ============================================

-- Add prompt_tokens column for input tokens
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER DEFAULT NULL;

-- Add completion_tokens column for output tokens
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS completion_tokens INTEGER DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.messages.prompt_tokens IS 'Number of tokens in the prompt/input';
COMMENT ON COLUMN public.messages.completion_tokens IS 'Number of tokens in the completion/output';
COMMENT ON COLUMN public.messages.tokens_used IS 'Total tokens used (prompt + completion) - kept for backwards compatibility';

