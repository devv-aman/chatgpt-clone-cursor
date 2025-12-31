import type { SupabaseClient } from "@supabase/supabase-js";

// Mock dependencies
jest.mock("../../src/db/client");
jest.mock("../../src/modules/settings/settings.service");
jest.mock("../../src/modules/stream/stream.service");
jest.mock("openai");

import { getSupabaseAdminClient } from "../../src/db/client";
import { settingsService } from "../../src/modules/settings/settings.service";
import { streamService } from "../../src/modules/stream/stream.service";
import { chatService } from "../../src/modules/chat/chat.service";
import { ERROR_MESSAGES } from "../../src/constants/errors";
import { CHAT_CONSTANTS } from "../../src/modules/chat/chat.constants";

const MOCK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const MOCK_CHAT_ID = "456e4567-e89b-12d3-a456-426614174001";
const MOCK_MESSAGE_ID = "789e4567-e89b-12d3-a456-426614174002";
const MOCK_STREAM_ID = "abc-stream-id";

const MOCK_CHAT = {
  id: MOCK_CHAT_ID,
  user_id: MOCK_USER_ID,
  title: CHAT_CONSTANTS.DEFAULT_TITLE,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
};

const MOCK_MESSAGE = {
  id: MOCK_MESSAGE_ID,
  chat_id: MOCK_CHAT_ID,
  role: "user",
  content: "Hello",
  model_id: null,
  model_name: null,
  tokens_used: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
};

describe("ChatService", () => {
  let mockAdminClient: Partial<SupabaseClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdminClient = {
      from: jest.fn(),
    };

    (getSupabaseAdminClient as jest.Mock).mockReturnValue(mockAdminClient);
  });

  describe("createChatSession", () => {
    it("should create a new chat session", async () => {
      const mockFrom = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: MOCK_CHAT, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await chatService.createChatSession(MOCK_USER_ID);

      expect(result).toEqual(MOCK_CHAT);
      expect(mockAdminClient.from).toHaveBeenCalledWith("chats");
      expect(mockFrom.insert).toHaveBeenCalledWith({
        user_id: MOCK_USER_ID,
        title: CHAT_CONSTANTS.DEFAULT_TITLE,
      });
    });

    it("should create a chat session with custom title", async () => {
      const customTitle = "My Custom Chat";
      const mockFrom = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...MOCK_CHAT, title: customTitle },
          error: null,
        }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await chatService.createChatSession(
        MOCK_USER_ID,
        customTitle
      );

      expect(result.title).toBe(customTitle);
      expect(mockFrom.insert).toHaveBeenCalledWith({
        user_id: MOCK_USER_ID,
        title: customTitle,
      });
    });

    it("should throw error if creation fails", async () => {
      const mockFrom = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      await expect(chatService.createChatSession(MOCK_USER_ID)).rejects.toThrow(
        ERROR_MESSAGES.CHAT.CREATE_FAILED
      );
    });
  });

  describe("getChatSession", () => {
    it("should return chat session if exists and owned by user", async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: MOCK_CHAT, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await chatService.getChatSession(
        MOCK_CHAT_ID,
        MOCK_USER_ID
      );

      expect(result).toEqual(MOCK_CHAT);
    });

    it("should throw NotFoundError if chat does not exist", async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      await expect(
        chatService.getChatSession(MOCK_CHAT_ID, MOCK_USER_ID)
      ).rejects.toThrow(ERROR_MESSAGES.CHAT.NOT_FOUND);
    });
  });

  describe("saveMessage", () => {
    it("should save a message to the chat", async () => {
      const mockFrom = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: MOCK_MESSAGE, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await chatService.saveMessage(
        MOCK_CHAT_ID,
        "user",
        "Hello"
      );

      expect(result).toEqual(MOCK_MESSAGE);
      expect(mockAdminClient.from).toHaveBeenCalledWith("messages");
    });

    it("should save a message with model info", async () => {
      const messageWithModel = {
        ...MOCK_MESSAGE,
        role: "assistant",
        model_id: "gpt-5.2",
        model_name: "gpt-5.2",
      };

      const mockFrom = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: messageWithModel, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await chatService.saveMessage(
        MOCK_CHAT_ID,
        "assistant",
        "Hello, how can I help?",
        "gpt-5.2",
        "gpt-5.2"
      );

      expect(result.model_id).toBe("gpt-5.2");
    });

    it("should throw error if save fails", async () => {
      const mockFrom = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      await expect(
        chatService.saveMessage(MOCK_CHAT_ID, "user", "Hello")
      ).rejects.toThrow(ERROR_MESSAGES.MESSAGE.CREATE_FAILED);
    });
  });

  describe("getMessagesForChat", () => {
    it("should return messages for a chat", async () => {
      // Mock for getChatSession
      const mockChatFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: MOCK_CHAT, error: null }),
      };

      // Mock for count
      const mockCountFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ count: 5, error: null }),
      };

      // Mock for messages
      const mockMessagesFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest
          .fn()
          .mockResolvedValue({ data: [MOCK_MESSAGE], error: null }),
      };

      (mockAdminClient.from as jest.Mock)
        .mockReturnValueOnce(mockChatFrom)
        .mockReturnValueOnce(mockCountFrom)
        .mockReturnValueOnce(mockMessagesFrom);

      const result = await chatService.getMessagesForChat(
        MOCK_CHAT_ID,
        MOCK_USER_ID
      );

      expect(result.messages).toHaveLength(1);
      expect(result.total).toBe(5);
    });
  });

  describe("getUserChats", () => {
    it("should return chats for a user", async () => {
      // Mock for count
      const mockCountFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ count: 3, error: null }),
      };

      // Mock for chats
      const mockChatsFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [MOCK_CHAT], error: null }),
      };

      // Mock for tokens aggregation
      const mockTokensFrom = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (mockAdminClient.from as jest.Mock)
        .mockReturnValueOnce(mockCountFrom)
        .mockReturnValueOnce(mockChatsFrom)
        .mockReturnValueOnce(mockTokensFrom);

      const result = await chatService.getUserChats(MOCK_USER_ID);

      expect(result.chats).toHaveLength(1);
      expect(result.total).toBe(3);
    });
  });

  describe("searchChats", () => {
    it("should return matching chats when query matches title", async () => {
      const matchingChat = { ...MOCK_CHAT, title: "Test Search Query" };

      // Mock for count
      const mockCountFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockResolvedValue({ count: 1, error: null }),
      };

      // Mock for search results
      const mockSearchFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest
          .fn()
          .mockResolvedValue({ data: [matchingChat], error: null }),
      };

      // Mock for tokens (no tokens for this chat)
      const mockTokensFrom = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (mockAdminClient.from as jest.Mock)
        .mockReturnValueOnce(mockCountFrom)
        .mockReturnValueOnce(mockSearchFrom)
        .mockReturnValueOnce(mockTokensFrom);

      const result = await chatService.searchChats(MOCK_USER_ID, "Search");

      expect(result.chats).toHaveLength(1);
      expect(result.chats[0].title).toBe("Test Search Query");
      expect(result.total).toBe(1);
    });

    it("should return empty array when no matches found", async () => {
      // Mock for count
      const mockCountFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockResolvedValue({ count: 0, error: null }),
      };

      // Mock for search results (empty)
      const mockSearchFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (mockAdminClient.from as jest.Mock)
        .mockReturnValueOnce(mockCountFrom)
        .mockReturnValueOnce(mockSearchFrom);

      const result = await chatService.searchChats(
        MOCK_USER_ID,
        "NonExistentQuery"
      );

      expect(result.chats).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should respect pagination limit and offset", async () => {
      const limit = 10;
      const offset = 5;

      // Mock for count
      const mockCountFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockResolvedValue({ count: 20, error: null }),
      };

      // Mock for search results
      const mockSearchFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [MOCK_CHAT], error: null }),
      };

      // Mock for tokens
      const mockTokensFrom = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (mockAdminClient.from as jest.Mock)
        .mockReturnValueOnce(mockCountFrom)
        .mockReturnValueOnce(mockSearchFrom)
        .mockReturnValueOnce(mockTokensFrom);

      await chatService.searchChats(MOCK_USER_ID, "test", limit, offset);

      expect(mockSearchFrom.range).toHaveBeenCalledWith(
        offset,
        offset + limit - 1
      );
    });

    it("should throw error if search fails", async () => {
      // Mock for count
      const mockCountFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockResolvedValue({
          count: null,
          error: { message: "Database error" },
        }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockCountFrom);

      await expect(
        chatService.searchChats(MOCK_USER_ID, "test")
      ).rejects.toThrow(ERROR_MESSAGES.SERVER.DATABASE_ERROR);
    });
  });

  describe("stopChatStream", () => {
    it("should call streamService.stopStream", async () => {
      (streamService.stopStream as jest.Mock).mockResolvedValue(undefined);

      await chatService.stopChatStream(MOCK_STREAM_ID, MOCK_USER_ID);

      expect(streamService.stopStream).toHaveBeenCalledWith(
        MOCK_STREAM_ID,
        MOCK_USER_ID
      );
    });
  });
});
