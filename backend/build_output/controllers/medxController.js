import { medxService } from '../services/medx.service.js';
export const getMedxPatients = async (req, res) => {
    try {
        const patients = await medxService.getPatients();
        res.json({
            success: true,
            count: patients?.length || 0,
            data: patients
        });
    }
    catch (error) {
        console.error('Error fetching MedX patients:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch patients from MedX'
        });
    }
};
export const getMedxAppointments = async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ error: 'start and end dates required (YYYY-MM-DD)' });
        }
        const appointments = await medxService.getAppointments(start, end);
        res.json({
            success: true,
            count: appointments?.length || 0,
            data: appointments
        });
    }
    catch (error) {
        console.error('Error fetching MedX appointments:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch appointments from MedX'
        });
    }
};
export const syncMedxPatients = async (req, res) => {
    try {
        const result = await medxService.syncPatientsToLocal();
        res.json({
            success: true,
            message: 'Sincronização concluída',
            details: result
        });
    }
    catch (error) {
        console.error('Error syncing MedX patients:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to sync patients from MedX'
        });
    }
};
//# sourceMappingURL=medxController.js.map