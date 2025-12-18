import { Router } from 'express';
import { verifyWebhook, receiveMessage } from '../controllers/message.controller.js';

const router = Router();

// 1. Endpoint para la verificación del Webhook (GET)
router.get('/', verifyWebhook);

// 2. Endpoint para recibir mensajes (POST)
router.post('/', receiveMessage);

export default router;