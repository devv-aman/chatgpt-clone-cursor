import { Router, type Router as RouterType } from "express";
import { chatController } from "./chat.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  streamChatSchema,
  chatParamsSchema,
  streamParamsSchema,
  messagesQuerySchema,
  chatsQuerySchema,
  searchQuerySchema,
} from "./chat.schema.js";
import { API_ROUTES } from "../../constants/api.js";

const router = Router();

/**
 * @swagger
 * /api/v1/chat/stream:
 *   post:
 *     summary: Start a chat stream
 *     description: Start SSE streaming chat with OpenAI. Returns chat_id and stream_id as first chunk.
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user message to send
 *               model:
 *                 type: string
 *                 description: OpenAI model to use
 *                 default: gpt-5.2
 *               chatId:
 *                 type: string
 *                 format: uuid
 *                 description: Existing chat ID (optional, creates new if not provided)
 *     responses:
 *       200:
 *         description: SSE stream started
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       400:
 *         description: OpenAI API key not set
 *       401:
 *         description: Unauthorized
 */
router.post(
  API_ROUTES.CHAT.STREAM,
  authMiddleware,
  validate({ body: streamChatSchema }),
  chatController.streamChat
);

/**
 * @swagger
 * /api/v1/chat/stream/{streamId}/stop:
 *   post:
 *     summary: Stop an active stream
 *     description: Stop a running chat stream and its background process
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The stream ID to stop
 *     responses:
 *       200:
 *         description: Stream stopped successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Stream not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  `${API_ROUTES.CHAT.STREAM}/:streamId${API_ROUTES.CHAT.STOP}`,
  authMiddleware,
  validate({ params: streamParamsSchema }),
  chatController.stopStream
);

export const chatRouter: RouterType = router;

// Separate router for /chats endpoints
const chatsRouterInstance = Router();

/**
 * @swagger
 * /api/v1/chats:
 *   get:
 *     summary: Get user's chat sessions
 *     description: Get all chat sessions for the authenticated user
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Number of chats to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of chats to skip
 *     responses:
 *       200:
 *         description: Chats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     chats:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Chat'
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
chatsRouterInstance.get(
  "/",
  authMiddleware,
  validate({ query: chatsQuerySchema }),
  chatController.getChats
);

/**
 * @swagger
 * /api/v1/chats/search:
 *   get:
 *     summary: Search user's chats
 *     description: Search chat sessions by title
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Search results fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     chats:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Chat'
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
chatsRouterInstance.get(
  API_ROUTES.CHATS.SEARCH,
  authMiddleware,
  validate({ query: searchQuerySchema }),
  chatController.searchChats
);

/**
 * @swagger
 * /api/v1/chats/{chatId}:
 *   get:
 *     summary: Get a specific chat
 *     description: Get details of a specific chat session
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The chat ID
 *     responses:
 *       200:
 *         description: Chat fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
chatsRouterInstance.get(
  "/:chatId",
  authMiddleware,
  validate({ params: chatParamsSchema }),
  chatController.getChat
);

/**
 * @swagger
 * /api/v1/chats/{chatId}/messages:
 *   get:
 *     summary: Get messages for a chat
 *     description: Get all messages for a specific chat session
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The chat ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of messages to skip
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *                     total:
 *                       type: integer
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
chatsRouterInstance.get(
  "/:chatId/messages",
  authMiddleware,
  validate({ params: chatParamsSchema, query: messagesQuerySchema }),
  chatController.getMessages
);

export const chatsRouter: RouterType = chatsRouterInstance;
