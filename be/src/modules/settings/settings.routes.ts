import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { saveOpenAIKeySchema } from './settings.schema.js';
import { API_ROUTES } from '../../constants/api.js';

const router = Router();

/**
 * @swagger
 * /api/v1/settings/openai-key:
 *   post:
 *     summary: Save OpenAI API key
 *     description: Securely save the user's OpenAI API key (encrypted)
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiKey
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: OpenAI API key (must start with sk-)
 *                 example: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *     responses:
 *       200:
 *         description: API key saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid API key format
 *       401:
 *         description: Unauthorized
 */
router.post(
  API_ROUTES.SETTINGS.OPENAI_KEY,
  authMiddleware,
  validate({ body: saveOpenAIKeySchema }),
  settingsController.saveOpenAIKey
);

/**
 * @swagger
 * /api/v1/settings/openai-key:
 *   get:
 *     summary: Check if OpenAI API key exists
 *     description: Check if the user has saved an OpenAI API key
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Key status retrieved
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
 *                     hasKey:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get(
  API_ROUTES.SETTINGS.OPENAI_KEY,
  authMiddleware,
  settingsController.getOpenAIKeyStatus
);

/**
 * @swagger
 * /api/v1/settings/openai-key:
 *   delete:
 *     summary: Delete OpenAI API key
 *     description: Remove the user's stored OpenAI API key
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 */
router.delete(
  API_ROUTES.SETTINGS.OPENAI_KEY,
  authMiddleware,
  settingsController.deleteOpenAIKey
);

export const settingsRouter = router;

