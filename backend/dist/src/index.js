/**
 * Ponto de entrada do Backend Worker
 * Servidor Express que mantém a sessão do WhatsApp ativa via Baileys
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/firebaseAdmin.js'; // Inicializa Firebase Admin
import whatsappRoutes, { initializeWhatsApp } from './routes/whatsapp.routes.js';
import n8nRoutes from './routes/n8n.routes.js'; // Importa rotas do n8n
dotenv.config();
const app = express();
// Garantir que PORT seja sempre um número
const portEnv = process.env.PORT;
const PORT = portEnv ? parseInt(portEnv, 10) : 3001;
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Health check (Railway usa /healthz, mas mantemos /health também)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/healthz', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Rotas do WhatsApp
app.use('/api/whatsapp', whatsappRoutes);
// Rotas do n8n
app.use('/api/n8n', n8nRoutes);
// Inicia servidor PRIMEIRO (para healthcheck funcionar)
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend Worker rodando na porta ${PORT}`);
    console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Health check disponível em /health e /healthz`);
    console.log(`📱 WhatsApp API disponível em /api/whatsapp`);
    console.log(`🔗 n8n Integration disponível em /api/n8n`);
    // Inicializa WhatsApp DEPOIS que o servidor já iniciou
    // (pode ser desabilitado inicialmente se preferir inicializar manualmente)
    if (process.env.WHATSAPP_AUTO_START !== 'false') {
        console.log(`📱 Inicializando WhatsApp...`);
        setTimeout(() => {
            try {
                initializeWhatsApp();
            }
            catch (error) {
                console.error('❌ Erro ao inicializar WhatsApp:', error);
            }
        }, 1000); // Aguarda 1 segundo após o servidor iniciar
    }
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recebido, encerrando servidor...');
    server.close(() => {
        console.log('Servidor encerrado');
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map