import { Request, Response } from 'express';
import { medxService } from '../services/medx.service.js';

export const getMedxPatients = async (req: Request, res: Response) => {
    try {
        const patients = await medxService.getPatients();
        res.json({
            success: true,
            count: patients?.length || 0,
            data: patients
        });
    } catch (error: any) {
        console.error('Error fetching MedX patients:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch patients from MedX'
        });
    }
};

export const getMedxAppointments = async (req: Request, res: Response) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ error: 'start and end dates required (YYYY-MM-DD)' });
        }

        const appointments = await medxService.getAppointments(start as string, end as string);
        res.json({
            success: true,
            count: appointments?.length || 0,
            data: appointments
        });
    } catch (error: any) {
        console.error('Error fetching MedX appointments:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch appointments from MedX'
        });
    }
};
