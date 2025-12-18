import { getTemplates, createTemplate } from '../services/meta.service.js';

// GET /api/templates
export const listTemplates = async (req, res) => {
    try {
        // Llama al servicio de Meta para obtener la lista
        const templates = await getTemplates(); 
        res.status(200).json(templates); 
    } catch (error) {
        console.error("Error al obtener plantillas de Meta:", error.message);
        // Usamos error.response para obtener detalles si es un error de Axios
        res.status(500).json({ 
            error: 'Fallo al obtener plantillas de Meta API', 
            details: error.response ? error.response.data : error.message 
        });
    }
};

// POST /api/templates
export const createNewTemplate = async (req, res) => {
    try {
        // Los datos ahora incluyen header y buttons
        const { name, category, language, body, header, buttons } = req.body; 

        // 1. Validación (Mínima):
        if (name.includes(' ') || name !== name.toLowerCase()) {
            return res.status(400).json({ details: "El nombre debe ser solo en minúsculas y sin espacios." });
        }

        // 2. Llamar al servicio con todos los componentes
        const response = await createTemplate({ name, category, language, body, header, buttons }); 
        
        res.status(200).json({ 
            message: 'Plantilla enviada a Meta para aprobación.', 
            template: response 
        });

    } catch (error) {
        console.error("Error al enviar plantilla a aprobación:", error.message);
        res.status(500).json({ 
            error: 'Fallo al crear plantilla', 
            details: error.response ? error.response.data : error.message 
        });
    }
};

// GET /api/config
export const getConfig = (req, res) => {
    // Definimos WABA_ID aquí para no importarlo en cada función
    const WABA_ID = process.env.WABA_ID;
    
    res.status(200).json({
        phoneId: process.env.WHATSAPP_PHONE_ID,
        wabaId: WABA_ID
    });
};