import { z } from 'zod';
import { clinicHours, holidays } from '../config/clinic';
import { getAllAppointments, getAppointmentById, createAppointment as createAppointmentDb, updateAppointment as updateAppointmentDb, deleteAppointment as deleteAppointmentDb, getAppointmentsByDate } from '../services/firestore.js';
// Firestore will be used for persistence; in‑memory array removed
// Zod schema for validation
const appointmentSchema = z.object({
    patientId: z.string(),
    patientName: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    duration: z.number().int().positive(),
    type: z.enum(['first_visit', 'return', 'evaluation']),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']),
    notes: z.string().optional(),
});
export const getAppointments = async (req, res) => {
    const { status, type, patientId } = req.query;
    const all = await getAllAppointments();
    let result = all;
    if (status)
        result = result.filter(a => a.status === status);
    if (type)
        result = result.filter(a => a.type === type);
    if (patientId)
        result = result.filter(a => a.patientId === patientId);
    res.json(result);
};
export const createAppointment = async (req, res) => {
    const parse = appointmentSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parse.error.errors });
    }
    const data = {
        ...parse.data,
        whatsappSent: false,
        reminderSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const newAppointment = await createAppointmentDb(data);
    res.status(201).json(newAppointment);
};
export const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const parse = appointmentSchema.partial().safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parse.error.errors });
    }
    const updated = await updateAppointmentDb(id, { ...parse.data, updatedAt: new Date().toISOString() });
    if (!updated)
        return res.status(404).json({ error: 'Appointment not found' });
    res.json(updated);
};
export const deleteAppointment = async (req, res) => {
    const { id } = req.params;
    const success = await deleteAppointmentDb(id);
    if (!success)
        return res.status(404).json({ error: 'Appointment not found' });
    res.status(204).send();
};
export const getAvailableSlots = async (req, res) => {
    const { date } = req.query;
    if (!date)
        return res.status(400).json({ error: 'date query param required' });
    if (holidays.includes(date)) {
        return res.json({ date, available: [] });
    }
    const startParts = clinicHours.start.split(':').map(Number);
    const endParts = clinicHours.end.split(':').map(Number);
    const lunchStartParts = clinicHours.lunchStart.split(':').map(Number);
    const lunchEndParts = clinicHours.lunchEnd.split(':').map(Number);
    const toMinutes = (h, m) => h * 60 + m;
    const startMin = toMinutes(startParts[0], startParts[1]);
    const endMin = toMinutes(endParts[0], endParts[1]);
    const lunchStartMin = toMinutes(lunchStartParts[0], lunchStartParts[1]);
    const lunchEndMin = toMinutes(lunchEndParts[0], lunchEndParts[1]);
    const slots = [];
    for (let minutes = startMin; minutes < endMin; minutes += 30) {
        if (minutes >= lunchStartMin && minutes < lunchEndMin)
            continue;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
    const taken = (await getAppointmentsByDate(date)).map(a => a.startTime);
    const available = slots.filter(s => !taken.includes(s));
    res.json({ date, available });
};
export const sendReminder = async (req, res) => {
    const { id } = req.params;
    const appointment = await getAppointmentById(id);
    if (!appointment)
        return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.reminderSent)
        return res.status(400).json({ error: 'Reminder already sent' });
    const message = `Lembrete: sua consulta ${appointment.type} está agendada para ${appointment.date} às ${appointment.startTime}.`;
    try {
        const { sendMessage } = await import('../services/whatsapp.js');
        await sendMessage(appointment.patientId, message);
        await updateAppointmentDb(id, { reminderSent: true, whatsappSent: true, updatedAt: new Date().toISOString() });
        res.json({ success: true, appointment });
    }
    catch (err) {
        console.error('WhatsApp error:', err);
        res.status(500).json({ error: 'Failed to send WhatsApp reminder' });
    }
};
//# sourceMappingURL=appointmentsController.js.map