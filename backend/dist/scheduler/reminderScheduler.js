// src/scheduler/reminderScheduler.ts
import cron from 'node-cron';
import { getAppointmentsByDate, updateAppointment } from '../services/firestore.js';
import { sendMessage } from '../services/whatsapp.js';
/**
 * Schedule a daily job at 08:00 AM server time to send WhatsApp reminders
 * for appointments occurring the next day that have not yet received a reminder.
 */
const scheduleReminderJob = () => {
    // Runs every day at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
            const appointments = await getAppointmentsByDate(dateStr);
            const pending = appointments.filter(a => !a.reminderSent);
            for (const appt of pending) {
                const message = `Lembrete: sua consulta ${appt.type} está agendada para ${appt.date} às ${appt.startTime}.`;
                try {
                    await sendMessage(appt.patientId, message);
                    await updateAppointment(appt.id, { reminderSent: true, whatsappSent: true, updatedAt: new Date().toISOString() });
                    console.log(`✅ Reminder sent for appointment ${appt.id}`);
                }
                catch (err) {
                    console.error(`❌ Failed to send reminder for appointment ${appt.id}:`, err);
                }
            }
        }
        catch (e) {
            console.error('Error in reminder scheduler job:', e);
        }
    });
    console.log('🕒 Reminder scheduler initialized (daily at 08:00).');
};
// Immediately start the scheduler when this module is imported
scheduleReminderJob();
export default scheduleReminderJob;
//# sourceMappingURL=reminderScheduler.js.map