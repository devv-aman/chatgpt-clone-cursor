import { randomUUID } from 'crypto';
import { getRedisClient } from '../../db/redis.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';
import { ERROR_MESSAGES } from '../../constants/errors.js';
import { STREAM_CONSTANTS, type StreamStatus } from './stream.constants.js';

export interface StreamData {
  streamId: string;
  chatId: string;
  userId: string;
  status: StreamStatus;
  createdAt: string;
}

// In-memory store for AbortControllers (cannot be serialized to Redis)
const abortControllers = new Map<string, AbortController>();

const getStreamKey = (streamId: string): string => {
  return `${STREAM_CONSTANTS.REDIS_KEYS.STREAM_PREFIX}${streamId}`;
};

export const createStream = async (
  chatId: string,
  userId: string
): Promise<{ streamId: string; abortController: AbortController }> => {
  const redis = getRedisClient();
  const streamId = randomUUID();
  const abortController = new AbortController();
  
  const streamData: StreamData = {
    streamId,
    chatId,
    userId,
    status: STREAM_CONSTANTS.STATUS.ACTIVE,
    createdAt: new Date().toISOString(),
  };
  
  // Store stream data in Redis
  await redis.setex(
    getStreamKey(streamId),
    STREAM_CONSTANTS.TTL.STREAM_DATA,
    JSON.stringify(streamData)
  );
  
  // Store AbortController in memory
  abortControllers.set(streamId, abortController);
  
  logger.info({ streamId, chatId, userId }, 'Stream created');
  
  return { streamId, abortController };
};

export const getStream = async (streamId: string): Promise<StreamData | null> => {
  const redis = getRedisClient();
  const data = await redis.get(getStreamKey(streamId));
  
  if (!data) {
    return null;
  }
  
  return JSON.parse(data) as StreamData;
};

export const updateStreamStatus = async (
  streamId: string,
  status: StreamStatus
): Promise<void> => {
  const redis = getRedisClient();
  const streamData = await getStream(streamId);
  
  if (!streamData) {
    logger.warn({ streamId }, 'Attempted to update non-existent stream');
    return;
  }
  
  streamData.status = status;
  
  await redis.setex(
    getStreamKey(streamId),
    STREAM_CONSTANTS.TTL.STREAM_DATA,
    JSON.stringify(streamData)
  );
  
  logger.info({ streamId, status }, 'Stream status updated');
};

export const stopStream = async (streamId: string, userId: string): Promise<void> => {
  const streamData = await getStream(streamId);
  
  if (!streamData) {
    throw new NotFoundError(ERROR_MESSAGES.STREAM.NOT_FOUND);
  }
  
  // Verify ownership
  if (streamData.userId !== userId) {
    throw new NotFoundError(ERROR_MESSAGES.STREAM.NOT_FOUND);
  }
  
  if (streamData.status !== STREAM_CONSTANTS.STATUS.ACTIVE) {
    logger.info({ streamId, status: streamData.status }, 'Stream already stopped');
    return;
  }
  
  // Abort the stream
  const abortController = abortControllers.get(streamId);
  if (abortController) {
    abortController.abort();
    abortControllers.delete(streamId);
  }
  
  // Update status in Redis
  await updateStreamStatus(streamId, STREAM_CONSTANTS.STATUS.STOPPED);
  
  logger.info({ streamId }, 'Stream stopped');
};

export const cleanupStream = async (streamId: string): Promise<void> => {
  const redis = getRedisClient();
  
  // Remove from memory
  abortControllers.delete(streamId);
  
  // Remove from Redis
  await redis.del(getStreamKey(streamId));
  
  logger.info({ streamId }, 'Stream cleaned up');
};

export const getAbortController = (streamId: string): AbortController | undefined => {
  return abortControllers.get(streamId);
};

export const isStreamActive = async (streamId: string): Promise<boolean> => {
  const streamData = await getStream(streamId);
  return streamData?.status === STREAM_CONSTANTS.STATUS.ACTIVE;
};

export const streamService = {
  createStream,
  getStream,
  updateStreamStatus,
  stopStream,
  cleanupStream,
  getAbortController,
  isStreamActive,
};

