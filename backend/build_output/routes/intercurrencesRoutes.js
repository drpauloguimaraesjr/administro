import { Router } from 'express';
import { getIntercurrences, createNewIntercurrence, updateIntercurrenceStatus } from '../controllers/intercurrencesController.js';
const router = Router();
// Retrieve open alerts
router.get('/', getIntercurrences);
// Create new alert (called by N8N Sentinel)
router.post('/', createNewIntercurrence);
// Update status (called by Frontend when Doctor resolves it)
router.put('/:id', updateIntercurrenceStatus);
export default router;
//# sourceMappingURL=intercurrencesRoutes.js.map