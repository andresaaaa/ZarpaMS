import { sendTemplateMessage } from '../services/whatsapp.service.js';

// Lógica para la verificación GET /webhook
export const verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook Verificado con Éxito');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400); 
    }
};

// Lógica para la recepción POST /webhook
export const receiveMessage = (req, res) => {
    let body = req.body;

    if (body.object === 'whatsapp_business_account') {
        body.entry.forEach(entry => {
            entry.changes.forEach(change => {
                if (change.field === 'messages') {
                    const messageData = change.value;

                    if (messageData.messages && messageData.messages[0]) {
                        const message = messageData.messages[0];
                        const from = message.from; 
                        const type = message.type; 

                        console.log(`Mensaje entrante de: ${from}`);

                        if (type === 'text') {
                            const text = message.text.body.toLowerCase();
                            console.log(`Contenido: ${text}`);
                            
                            // Aquí usamos el servicio para responder
                            sendTemplateMessage(from, 'hello_world'); 
                        } 
                    }
                }
            });
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404); 
    }
};