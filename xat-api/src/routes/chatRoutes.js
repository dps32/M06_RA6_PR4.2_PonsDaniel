const express = require('express');
const router = express.Router();
const { registerPrompt, getConversation, listOllamaModels, analyzeSentiment } = require('../controllers/chatController');

/**
 * @swagger
 * /api/chat/prompt:
 *   post:
 *     summary: Crear un nou prompt o afegir-lo a una conversa existent
 *     tags: [Prompts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la conversa (opcional)
 *               prompt:
 *                 type: string
 *                 description: Text del prompt
 *                 default: Diga'm el nom d'una bona cançó composada en els darrers 10 anys amb cantant i canço no massivament coneguts
 *               model:
 *                 type: string
 *                 description: Model d'Ollama a utilitzar
 *                 default: qwen2.5vl:7b
 *               stream:
 *                 type: boolean
 *                 description: Indica si la resposta ha de ser en streaming
 *                 default: false
 *     responses:
 *       201:
 *         description: Prompt registrat correctament
 *       400:
 *         description: Dades invàlides
 *       404:
 *         description: Conversa no trobada
 */
router.post('/prompt', registerPrompt);

/**
 * @swagger
 * /api/chat/conversation/{id}:
 *   get:
 *     summary: Obtenir una conversa per ID
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID de la conversa
 *     responses:
 *       200:
 *         description: Conversa trobada
 *       404:
 *         description: Conversa no trobada
 */
router.get('/conversation/:id', getConversation);

/**
 * @swagger
 * /api/chat/models:
 *   get:
 *     summary: Llistar models disponibles a Ollama
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Llista de models disponibles
 *       500:
 *         description: Error al recuperar models
 */
router.get('/models', listOllamaModels);

/**
 * @swagger
 * /api/chat/sentiment-analysis:
 *   post:
 *     summary: Analitza sentiment d'un text (retorna puntuacio 0-10)
 *     tags: [Sentiment Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: el text que vols analitzar
 *                 example: Aquest producte és absolutament increïble! Estic molt satisfet amb la meva compra.
 *     responses:
 *       201:
 *         description: Analisi completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 text:
 *                   type: string
 *                 score:
 *                   type: number
 *                   format: float
 *                   minimum: 0
 *                   maximum: 10
 *                   description: puntuacio (0=negatiu, 10=positiu)
 *                 sentiment:
 *                   type: string
 *                   enum: [positiu, negatiu, neutral]
 *                 model:
 *                   type: string
 *                   description: model ollama
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: text invalid
 *       500:
 *         description: error
 */
router.post('/sentiment-analysis', analyzeSentiment);

module.exports = router;
