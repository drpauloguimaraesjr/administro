import { Router } from 'express';
import { createDocument, getDocument, getDocuments, deleteDocument, getSignatureQueue, signDocumentsBatch, removeFromQueue, sendDocument, downloadDocument } from '../controllers/documentController.js';
const router = Router();
// Document CRUD
router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);
// Signature Queue
router.get('/queue/pending', getSignatureQueue);
router.post('/queue/sign-batch', signDocumentsBatch);
router.delete('/queue/:id', removeFromQueue);
// Actions
router.post('/:id/send', sendDocument);
router.get('/:id/download', downloadDocument);
export default router;
//# sourceMappingURL=documentRoutes.js.map