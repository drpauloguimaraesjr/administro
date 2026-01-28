/**
 * Ponto de entrada principal do backend
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import whatsappRoutes from './routes/whatsapp.routes.js';
import n8nRoutes from './routes/n8n.routes.js';
import medxRoutes from './routes/medx.routes.js';
import { initializeWhatsApp } from './services/whatsapp.js';
import appointmentsRoutes from './routes/appointments.js';
import patientsRoutes from './routes/patients.js';
import medicalRecordsRoutes from './routes/medicalRecords.js';
import paymentsRoutes from './routes/payments.js';
import questionnairesRoutes from './routes/questionnaires.js';
import leadsRoutes from './routes/leads.js';
import { usersRouter } from './routes/users.js';
import { whatsappQueuesRouter } from './routes/whatsapp-queues.js';
import intercurrencesRoutes from './routes/intercurrencesRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Permite qualquer origem temporariamente para debug
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Error handling for payload too large
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === 'entity.too.large') {
    console.error('❌ Payload too large:', err.limit, err.length);
    res.status(413).send({ error: 'Payload too large', details: err.message });
  } else {
    next(err);
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Administro Backend Running 🚀');
});

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
app.use('/api/patients', patientsRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/questionnaires', questionnairesRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/users', usersRouter);
app.use('/api/whatsapp/queues', whatsappQueuesRouter);
app.use('/api/medx', medxRoutes);
app.use('/api/intercurrences', intercurrencesRoutes);
app.use('/api/knowledge', knowledgeRoutes);

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
  console.log(`   - CRUD /api/patients`);
  console.log(`   - /api/users`);
  console.log(`   - /api/intercurrences`);
  console.log(`   - /api/knowledge`);

  // Inicializa WhatsApp se configurado
  if (process.env.WHATSAPP_AUTO_START === 'true') {
    try {
      await initializeWhatsApp();
    } catch (error: any) {
      console.error('❌ Erro ao inicializar WhatsApp:', error.message);
    }
  }
});

