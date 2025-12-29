import type { Redis } from 'ioredis';

// Mock Redis client
jest.mock('../../src/db/redis');

import { getRedisClient } from '../../src/db/redis';
import { streamService, STREAM_CONSTANTS } from '../../src/modules/stream';
import { ERROR_MESSAGES } from '../../src/constants/errors';

const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
const MOCK_CHAT_ID = '456e4567-e89b-12d3-a456-426614174001';
const MOCK_STREAM_ID = '789e4567-e89b-12d3-a456-426614174002';

describe('StreamService', () => {
  let mockRedis: Partial<Redis>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRedis = {
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
    };

    (getRedisClient as jest.Mock).mockReturnValue(mockRedis);
  });

  describe('createStream', () => {
    it('should create a new stream and return streamId and abortController', async () => {
      const result = await streamService.createStream(MOCK_CHAT_ID, MOCK_USER_ID);

      expect(result.streamId).toBeDefined();
      expect(result.abortController).toBeInstanceOf(AbortController);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('stream:'),
        STREAM_CONSTANTS.TTL.STREAM_DATA,
        expect.any(String)
      );
    });
  });

  describe('getStream', () => {
    it('should return stream data if exists', async () => {
      const streamData = {
        streamId: MOCK_STREAM_ID,
        chatId: MOCK_CHAT_ID,
        userId: MOCK_USER_ID,
        status: STREAM_CONSTANTS.STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
      };

      (mockRedis.get as jest.Mock).mockResolvedValue(JSON.stringify(streamData));

      const result = await streamService.getStream(MOCK_STREAM_ID);

      expect(result).toEqual(streamData);
    });

    it('should return null if stream does not exist', async () => {
      (mockRedis.get as jest.Mock).mockResolvedValue(null);

      const result = await streamService.getStream(MOCK_STREAM_ID);

      expect(result).toBeNull();
    });
  });

  describe('updateStreamStatus', () => {
    it('should update stream status in Redis', async () => {
      const streamData = {
        streamId: MOCK_STREAM_ID,
        chatId: MOCK_CHAT_ID,
        userId: MOCK_USER_ID,
        status: STREAM_CONSTANTS.STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
      };

      (mockRedis.get as jest.Mock).mockResolvedValue(JSON.stringify(streamData));

      await streamService.updateStreamStatus(MOCK_STREAM_ID, STREAM_CONSTANTS.STATUS.COMPLETED);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `stream:${MOCK_STREAM_ID}`,
        STREAM_CONSTANTS.TTL.STREAM_DATA,
        expect.stringContaining(STREAM_CONSTANTS.STATUS.COMPLETED)
      );
    });

    it('should not throw if stream does not exist', async () => {
      (mockRedis.get as jest.Mock).mockResolvedValue(null);

      await expect(
        streamService.updateStreamStatus(MOCK_STREAM_ID, STREAM_CONSTANTS.STATUS.COMPLETED)
      ).resolves.not.toThrow();
    });
  });

  describe('stopStream', () => {
    it('should throw NotFoundError if stream does not exist', async () => {
      (mockRedis.get as jest.Mock).mockResolvedValue(null);

      await expect(
        streamService.stopStream(MOCK_STREAM_ID, MOCK_USER_ID)
      ).rejects.toThrow(ERROR_MESSAGES.STREAM.NOT_FOUND);
    });

    it('should throw NotFoundError if user does not own stream', async () => {
      const streamData = {
        streamId: MOCK_STREAM_ID,
        chatId: MOCK_CHAT_ID,
        userId: 'different-user-id',
        status: STREAM_CONSTANTS.STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
      };

      (mockRedis.get as jest.Mock).mockResolvedValue(JSON.stringify(streamData));

      await expect(
        streamService.stopStream(MOCK_STREAM_ID, MOCK_USER_ID)
      ).rejects.toThrow(ERROR_MESSAGES.STREAM.NOT_FOUND);
    });

    it('should not throw if stream is already stopped', async () => {
      const streamData = {
        streamId: MOCK_STREAM_ID,
        chatId: MOCK_CHAT_ID,
        userId: MOCK_USER_ID,
        status: STREAM_CONSTANTS.STATUS.STOPPED,
        createdAt: new Date().toISOString(),
      };

      (mockRedis.get as jest.Mock).mockResolvedValue(JSON.stringify(streamData));

      await expect(
        streamService.stopStream(MOCK_STREAM_ID, MOCK_USER_ID)
      ).resolves.not.toThrow();
    });
  });

  describe('cleanupStream', () => {
    it('should delete stream from Redis', async () => {
      await streamService.cleanupStream(MOCK_STREAM_ID);

      expect(mockRedis.del).toHaveBeenCalledWith(`stream:${MOCK_STREAM_ID}`);
    });
  });

  describe('isStreamActive', () => {
    it('should return true if stream is active', async () => {
      const streamData = {
        streamId: MOCK_STREAM_ID,
        chatId: MOCK_CHAT_ID,
        userId: MOCK_USER_ID,
        status: STREAM_CONSTANTS.STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
      };

      (mockRedis.get as jest.Mock).mockResolvedValue(JSON.stringify(streamData));

      const result = await streamService.isStreamActive(MOCK_STREAM_ID);

      expect(result).toBe(true);
    });

    it('should return false if stream is not active', async () => {
      const streamData = {
        streamId: MOCK_STREAM_ID,
        chatId: MOCK_CHAT_ID,
        userId: MOCK_USER_ID,
        status: STREAM_CONSTANTS.STATUS.COMPLETED,
        createdAt: new Date().toISOString(),
      };

      (mockRedis.get as jest.Mock).mockResolvedValue(JSON.stringify(streamData));

      const result = await streamService.isStreamActive(MOCK_STREAM_ID);

      expect(result).toBe(false);
    });

    it('should return false if stream does not exist', async () => {
      (mockRedis.get as jest.Mock).mockResolvedValue(null);

      const result = await streamService.isStreamActive(MOCK_STREAM_ID);

      expect(result).toBe(false);
    });
  });
});

