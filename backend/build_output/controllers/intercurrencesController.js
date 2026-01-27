import { z } from 'zod';
import { createIntercurrence, getOpenIntercurrences, updateIntercurrence } from '../services/firestore.js';
// Schema Validation
const intercurrenceSchema = z.object({
    patientId: z.string(),
    patientName: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['open', 'investigating', 'resolved']).default('open'),
    description: z.string().min(3),
    aiAnalysis: z.object({
        summary: z.string(),
        suggestion: z.string(),
        riskScore: z.number(),
    }).optional(),
    chatContext: z.string().optional(),
});
export const getIntercurrences = async (req, res) => {
    try {
        const intercurrences = await getOpenIntercurrences();
        res.json(intercurrences);
    }
    catch (error) {
        console.error('Error fetching intercurrences:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const createNewIntercurrence = async (req, res) => {
    const parse = intercurrenceSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parse.error.errors });
    }
    try {
        const data = {
            ...parse.data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const created = await createIntercurrence(data);
        res.status(201).json(created);
    }
    catch (error) {
        console.error('Error creating intercurrence:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const updateIntercurrenceStatus = async (req, res) => {
    const { id } = req.params;
    const { status, aiAnalysis } = req.body;
    // Simple partial validation
    if (status && !['open', 'investigating', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        const updateData = { updatedAt: new Date().toISOString() };
        if (status)
            updateData.status = status;
        if (aiAnalysis)
            updateData.aiAnalysis = aiAnalysis;
        const updated = await updateIntercurrence(id, updateData);
        if (!updated)
            return res.status(404).json({ error: 'Intercurrence not found' });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating intercurrence:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
//# sourceMappingURL=intercurrencesController.js.map