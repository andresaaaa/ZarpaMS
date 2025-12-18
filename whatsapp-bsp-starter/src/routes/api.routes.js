import { Router } from 'express';
// Importamos el controlador existente
import { listTemplates, createNewTemplate, getConfig } from '../controllers/template.controller.js';
// Importamos el nuevo controlador
import { bulkSend } from '../controllers/bulk.controller.js'; 

const router = Router();

// Rutas de Plantillas
router.get('/templates', listTemplates);
router.post('/templates', createNewTemplate);
router.get('/config', getConfig);

// ----------------------------------------------------
// 🚨 NUEVA RUTA: Envío Masivo (POST /api/bulk-send)
// ----------------------------------------------------
router.post('/bulk-send', bulkSend);

export default router;