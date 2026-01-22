// src/routes/appointments.ts
import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointment, deleteAppointment, getAvailableSlots, sendReminder } from '../controllers/appointmentsController.js';
const router = Router();
// CRUD endpoints
router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
// Additional endpoints
router.get('/available-slots', getAvailableSlots);
router.post('/:id/send-reminder', sendReminder);
export default router;
//# sourceMappingURL=appointments.js.map