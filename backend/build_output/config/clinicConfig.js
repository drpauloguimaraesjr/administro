// src/config/clinic.ts
/**
 * Configuration for clinic operating hours, lunch break, and holidays.
 */
export const clinicHours = {
    start: '08:00', // opening time (HH:mm)
    end: '18:00', // closing time (HH:mm)
    lunchStart: '12:00',
    lunchEnd: '13:00',
};
// List of holiday dates (ISO strings) when the clinic is closed.
export const holidays = [
    // Example holidays – adjust as needed
    '2026-01-01', // New Year's Day
    '2026-04-21', // Tiradentes
    '2026-05-01', // Labor Day
    '2026-09-07', // Independence Day
    '2026-12-25', // Christmas
];
//# sourceMappingURL=clinicConfig.js.map