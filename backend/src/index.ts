/**
 * Ponto de entrada principal do backend
 */

import express from 'express';
import cors from 'cors';
import n8nRoutes from './routes/n8n.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import { initializeWhatsApp } from './services/whatsapp.js';
import appointmentsRoutes from './routes/appointments.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
  });
});

// Rotas
app.use('/api/n8n', n8nRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Inicia servidor
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const portEnv = process.env.PORT;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/healthz`);
  console.log(`🔗 Rotas disponíveis:`);
  console.log(`   - POST /api/n8n/create-transaction`);
  console.log(`   - POST /api/whatsapp/message`);
  console.log(`   - GET /api/whatsapp/qr`);
  console.log(`   - GET /api/whatsapp/status`);

  // Inicializa WhatsApp se configurado
  if (process.env.WHATSAPP_AUTO_START === 'true') {
    try {
      await initializeWhatsApp();
    } catch (error: any) {
      console.error('❌ Erro ao inicializar WhatsApp:', error.message);
    }
  }
});

