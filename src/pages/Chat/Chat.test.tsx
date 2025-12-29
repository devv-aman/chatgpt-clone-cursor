import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Chat } from './Chat';
import { CHAT_STRINGS } from './constants';

// Mock the useChat hook
vi.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    chatId: null,
    streamId: null,
    messages: [],
    currentResponse: '',
    status: 'idle',
    error: null,
    tokensUsed: null,
    sendMessage: vi.fn(),
    stopStream: vi.fn(),
    startNewChat: vi.fn(),
    loadChatMessages: vi.fn(),
    isStreaming: false,
  }),
}));

function renderChat(initialRoute = '/') {
  return render(
    <ThemeProvider defaultTheme="light">
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/chat/:chatId" element={<Chat />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the prompt container centered when no messages', () => {
    renderChat();
    
    expect(screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER)).toBeInTheDocument();
  });

  it('renders send button', () => {
    renderChat();
    
    expect(screen.getByRole('button', { name: CHAT_STRINGS.SEND_LABEL })).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    renderChat();
    
    const sendButton = screen.getByRole('button', { name: CHAT_STRINGS.SEND_LABEL });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', async () => {
    const user = userEvent.setup();
    renderChat();
    
    const textarea = screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER);
    await user.type(textarea, 'Hello');
    
    const sendButton = screen.getByRole('button', { name: CHAT_STRINGS.SEND_LABEL });
    expect(sendButton).not.toBeDisabled();
  });
});

describe('PromptContainer', () => {
  it('allows shift+enter for new line', async () => {
    const user = userEvent.setup();
    renderChat();
    
    const textarea = screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER);
    await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');
    
    expect(textarea).toHaveValue('Line 1\nLine 2');
  });

  it('has correct placeholder text', () => {
    renderChat();
    
    const textarea = screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER);
    expect(textarea).toBeInTheDocument();
  });
});

