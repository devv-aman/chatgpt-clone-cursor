import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { PromptContainer } from './PromptContainer';
import { CHAT_STRINGS } from '../constants';

function renderPromptContainer(props = {}) {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    onStop: vi.fn(),
    isStreaming: false,
  };

  return render(
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <PromptContainer {...defaultProps} {...props} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

describe('PromptContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea with placeholder', () => {
    renderPromptContainer();
    
    expect(screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER)).toBeInTheDocument();
  });

  it('renders send button when not streaming', () => {
    renderPromptContainer();
    
    expect(screen.getByRole('button', { name: CHAT_STRINGS.SEND_LABEL })).toBeInTheDocument();
  });

  it('renders stop button when streaming', () => {
    renderPromptContainer({ isStreaming: true });
    
    expect(screen.getByRole('button', { name: CHAT_STRINGS.STOP_LABEL })).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderPromptContainer({ onChange });
    
    const textarea = screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER);
    await user.type(textarea, 'a');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onSubmit when clicking send button with text', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderPromptContainer({ value: 'Hello', onSubmit });
    
    const sendButton = screen.getByRole('button', { name: CHAT_STRINGS.SEND_LABEL });
    await user.click(sendButton);
    
    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onStop when clicking stop button during streaming', async () => {
    const onStop = vi.fn();
    const user = userEvent.setup();
    renderPromptContainer({ isStreaming: true, onStop });
    
    const stopButton = screen.getByRole('button', { name: CHAT_STRINGS.STOP_LABEL });
    await user.click(stopButton);
    
    expect(onStop).toHaveBeenCalled();
  });

  it('disables send button when value is empty', () => {
    renderPromptContainer({ value: '' });
    
    const sendButton = screen.getByRole('button', { name: CHAT_STRINGS.SEND_LABEL });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when value has text', () => {
    renderPromptContainer({ value: 'Hello' });
    
    const sendButton = screen.getByRole('button', { name: CHAT_STRINGS.SEND_LABEL });
    expect(sendButton).not.toBeDisabled();
  });

  it('allows shift+enter without submitting', async () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderPromptContainer({ value: 'Test', onSubmit, onChange });
    
    const textarea = screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER);
    await user.type(textarea, '{Shift>}{Enter}{/Shift}');
    
    // Should not call onSubmit for shift+enter
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

