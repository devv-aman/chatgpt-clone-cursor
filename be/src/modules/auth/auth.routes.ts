import { Router, type Router as RouterType } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { API_ROUTES } from '../../constants/api.js';

const router: RouterType = Router();

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password. If email confirmation is enabled in Supabase, tokens will be null until email is confirmed.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictError'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post(
  API_ROUTES.AUTH.REGISTER,
  validate({ body: registerSchema }),
  authController.register
);

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post(
  API_ROUTES.AUTH.LOGIN,
  validate({ body: loginSchema }),
  authController.login
);

/**
 * @swagger
 * /v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate the current user session
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
router.post(
  API_ROUTES.AUTH.LOGOUT,
  authMiddleware,
  authController.logout
);

/**
 * @swagger
 * /v1/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
router.get(
  API_ROUTES.AUTH.ME,
  authMiddleware,
  authController.me
);

export const authRouter = router;
