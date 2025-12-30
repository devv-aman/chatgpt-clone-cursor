import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ModelProvider } from "@/providers/ModelProvider";
import { Chat } from "./Chat";
import { CHAT_STRINGS } from "./constants";

// Mock the Zustand store
const mockChatStore = {
  chats: new Map(),
  activeChatId: null,
  chatList: [],
  chatListTotal: 0,
  chatListLoading: false,
  pendingMessage: null,
  setActiveChat: vi.fn(),
  clearActiveChat: vi.fn(),
  loadChatMessages: vi.fn(),
  sendMessage: vi.fn(),
  stopStream: vi.fn(),
  loadChatList: vi.fn(),
  addChatToList: vi.fn(),
  updateChatInList: vi.fn(),
  getChatState: vi.fn(() => null),
  getActiveChat: vi.fn(() => null),
  appendContent: vi.fn(),
};

vi.mock("@/stores", () => ({
  useChatStore: (selector: (state: typeof mockChatStore) => unknown) =>
    selector(mockChatStore),
}));

// Mock the auth provider
vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  }),
}));

function renderChat(initialRoute = "/") {
  return render(
    <ThemeProvider defaultTheme="light">
      <ModelProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/chat/:chatId" element={<Chat />} />
          </Routes>
        </MemoryRouter>
      </ModelProvider>
    </ThemeProvider>
  );
}

describe("Chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChatStore.chats = new Map();
    mockChatStore.activeChatId = null;
  });

  it("renders the prompt container centered when no messages", () => {
    renderChat();

    expect(
      screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER)
    ).toBeInTheDocument();
  });

  it("renders send button", () => {
    renderChat();

    expect(
      screen.getByRole("button", { name: CHAT_STRINGS.SEND_LABEL })
    ).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    renderChat();

    const sendButton = screen.getByRole("button", {
      name: CHAT_STRINGS.SEND_LABEL,
    });
    expect(sendButton).toBeDisabled();
  });

  it("enables send button when input has text", async () => {
    const user = userEvent.setup();
    renderChat();

    const textarea = screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER);
    await user.type(textarea, "Hello");

    const sendButton = screen.getByRole("button", {
      name: CHAT_STRINGS.SEND_LABEL,
    });
    expect(sendButton).not.toBeDisabled();
  });
});

describe("PromptContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChatStore.chats = new Map();
    mockChatStore.activeChatId = null;
  });

  it("allows shift+enter for new line", async () => {
    const user = userEvent.setup();
    renderChat();

    const textarea = screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER);
    await user.type(textarea, "Line 1{Shift>}{Enter}{/Shift}Line 2");

    expect(textarea).toHaveValue("Line 1\nLine 2");
  });

  it("has correct placeholder text", () => {
    renderChat();

    const textarea = screen.getByPlaceholderText(CHAT_STRINGS.PLACEHOLDER);
    expect(textarea).toBeInTheDocument();
  });
});
