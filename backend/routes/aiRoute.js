import express from "express";
import { recommendDoctor } from "../controllers/aiRecommendationController.js";
import authUser from "../middleware/authUser.js";

const aiRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered doctor recommendation
 */

/**
 * @swagger
 * /api/ai/recommend-doctor:
 *   post:
 *     summary: Get AI-based doctor recommendations
 *     description: >
 *       Uses AI to recommend suitable doctors based on patient symptoms.
 *       This feature assists users in selecting the right doctor and does NOT diagnose diseases.
 *     tags: [AI]
 *     security:
 *       - UserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symptoms
 *             properties:
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - chest pain
 *                   - shortness of breath
 *                   - fatigue
 *     responses:
 *       200:
 *         description: AI doctor recommendation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     recommendedDoctors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Dr. Richard James
 *                           speciality:
 *                             type: string
 *                             example: General physician
 *                           reason:
 *                             type: string
 *                             example: Initial assessment for common symptoms
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: AI recommendation failed
 */

aiRouter.post("/recommend-doctor", authUser, recommendDoctor);

export default aiRouter;
