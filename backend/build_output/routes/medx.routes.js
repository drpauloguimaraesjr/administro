import { Router } from 'express';
import { getMedxPatients, getMedxAppointments, syncMedxPatients } from '../controllers/medxController.js';
const router = Router();
// Rota para testar a busca de pacientes
// GET /api/medx/patients
router.get('/patients', getMedxPatients);
// Rota para buscar agenda
// GET /api/medx/appointments?start=2024-01-01&end=2024-01-31
router.get('/appointments', getMedxAppointments);
// Rota para sincronizar pacientes (Salvar no banco local)
// POST /api/medx/sync
router.post('/sync', syncMedxPatients);
export default router;
//# sourceMappingURL=medx.routes.js.map