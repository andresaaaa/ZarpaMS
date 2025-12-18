import { sendBulkTemplateMessage } from '../services/whatsapp.service.js';

// POST /api/bulk-send
export const bulkSend = async (req, res) => {
    try {
        const { templateName, recipients } = req.body;
        
        if (!templateName || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ error: "Datos de envío masivo incompletos o inválidos." });
        }

        // Llamar al servicio para realizar el envío
        const results = await sendBulkTemplateMessage(recipients, templateName);

        // Contar éxitos y fallos
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        res.status(200).json({ 
            message: `Envío masivo completado. Éxitos: ${successCount}, Fallos: ${failureCount}`, 
            results: results 
        });

    } catch (error) {
        console.error("Error en el controlador de envío masivo:", error);
        res.status(500).json({ error: 'Fallo interno del servidor durante el envío masivo.' });
    }
};