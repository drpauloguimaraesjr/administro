import { Request, Response } from 'express';
import admin, { db } from '../config/firebaseAdmin.js';
import { compileToPdf, deletePdf, DocumentType, ReceitaData, AtestadoData, EvolucaoData } from '../services/typstService.js';
import { v4 as uuidv4 } from 'uuid';

const Timestamp = admin.firestore.Timestamp;

const DOCUMENTS_COLLECTION = 'medical_documents';
const SIGNATURE_QUEUE_COLLECTION = 'signature_queue';

interface DocumentMetadata {
    id: string;
    type: DocumentType;
    patientName: string;
    patientCpf?: string;
    description: string;
    status: 'draft' | 'pending_signature' | 'signed' | 'sent';
    pdfUrl?: string;
    signedPdfUrl?: string;
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
    signedAt?: FirebaseFirestore.Timestamp;
    sentAt?: FirebaseFirestore.Timestamp;
    sentVia?: 'email' | 'whatsapp' | 'print';
    doctorId: string;
    data: ReceitaData | AtestadoData | EvolucaoData;
}

/**
 * Create a new document and optionally add to signature queue
 */
export const createDocument = async (req: Request, res: Response) => {
    try {
        const { type, data, addToQueue = true } = req.body as {
            type: DocumentType;
            data: ReceitaData | AtestadoData | EvolucaoData;
            addToQueue?: boolean;
        };

        if (!type || !data) {
            return res.status(400).json({ error: 'Type and data are required' });
        }

        // Compile document to PDF
        const { pdfPath, pdfBuffer, documentId } = await compileToPdf(type, data);

        // Generate description
        let description = '';
        if (type === 'receita') {
            const d = data as ReceitaData;
            description = `Receita - ${d.medicamentos.map(m => m.nome).join(', ')}`;
        } else if (type === 'atestado') {
            const d = data as AtestadoData;
            description = `Atestado - ${d.dias_afastamento} dia(s)`;
        } else if (type === 'evolucao') {
            const d = data as EvolucaoData;
            description = `${d.tipo_atendimento || 'Evolução'} - ${d.hipotese_diagnostica || 'Consulta'}`;
        }

        // Create document metadata
        const docMetadata: Omit<DocumentMetadata, 'id'> = {
            type,
            patientName: (data as any).paciente_nome,
            patientCpf: (data as any).paciente_cpf,
            description,
            status: addToQueue ? 'pending_signature' : 'draft',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            doctorId: 'default', // TODO: Get from auth
            data,
        };

        // Save to Firestore
        await db.collection(DOCUMENTS_COLLECTION).doc(documentId).set({
            id: documentId,
            ...docMetadata
        });

        // If adding to signature queue
        if (addToQueue) {
            await db.collection(SIGNATURE_QUEUE_COLLECTION).doc(documentId).set({
                documentId,
                type,
                patientName: (data as any).paciente_nome,
                description,
                createdAt: Timestamp.now(),
                doctorId: 'default',
            });
        }

        // Return PDF as base64 for preview
        const pdfBase64 = pdfBuffer.toString('base64');

        res.json({
            success: true,
            documentId,
            type,
            description,
            status: addToQueue ? 'pending_signature' : 'draft',
            pdfBase64,
            message: addToQueue
                ? 'Documento criado e adicionado à fila de assinaturas'
                : 'Documento criado como rascunho'
        });

    } catch (error: any) {
        console.error('Error creating document:', error);
        res.status(500).json({ error: error.message || 'Failed to create document' });
    }
};

/**
 * Get signature queue (pending documents)
 */
export const getSignatureQueue = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection(SIGNATURE_QUEUE_COLLECTION)
            .orderBy('createdAt', 'desc')
            .get();

        const queue = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            count: queue.length,
            items: queue
        });

    } catch (error: any) {
        console.error('Error fetching signature queue:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Sign documents in batch (placeholder for BirdID integration)
 */
export const signDocumentsBatch = async (req: Request, res: Response) => {
    try {
        const { documentIds, birdIdCode } = req.body as {
            documentIds: string[];
            birdIdCode: string;
        };

        if (!documentIds || documentIds.length === 0) {
            return res.status(400).json({ error: 'No documents selected' });
        }

        if (!birdIdCode) {
            return res.status(400).json({ error: 'BirdID code is required' });
        }

        // TODO: Integrate with BirdID API
        // For now, simulate signing
        const results: { documentId: string; success: boolean; error?: string }[] = [];

        for (const docId of documentIds) {
            try {
                // Update document status
                await db.collection(DOCUMENTS_COLLECTION).doc(docId).update({
                    status: 'signed',
                    signedAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });

                // Remove from signature queue
                await db.collection(SIGNATURE_QUEUE_COLLECTION).doc(docId).delete();

                results.push({ documentId: docId, success: true });
            } catch (error: any) {
                results.push({ documentId: docId, success: false, error: error.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        res.json({
            success: failCount === 0,
            message: `${successCount} documento(s) assinado(s)${failCount > 0 ? `, ${failCount} com erro` : ''}`,
            results
        });

    } catch (error: any) {
        console.error('Error signing documents:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get document by ID with PDF
 */
export const getDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const doc = await db.collection(DOCUMENTS_COLLECTION).doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const data = doc.data() as DocumentMetadata;

        // Regenerate PDF if needed
        const { pdfBuffer } = await compileToPdf(data.type, data.data);
        const pdfBase64 = pdfBuffer.toString('base64');

        res.json({
            ...data,
            pdfBase64
        });

    } catch (error: any) {
        console.error('Error fetching document:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all documents with filters
 */
export const getDocuments = async (req: Request, res: Response) => {
    try {
        const { status, type, patientName } = req.query;

        let query: FirebaseFirestore.Query = db.collection(DOCUMENTS_COLLECTION);

        if (status) {
            query = query.where('status', '==', status);
        }

        if (type) {
            query = query.where('type', '==', type);
        }

        query = query.orderBy('createdAt', 'desc').limit(100);

        const snapshot = await query.get();

        let documents = snapshot.docs.map(doc => doc.data());

        // Filter by patient name if provided (client-side filter)
        if (patientName) {
            const searchTerm = (patientName as string).toLowerCase();
            documents = documents.filter(d =>
                d.patientName?.toLowerCase().includes(searchTerm)
            );
        }

        res.json({
            count: documents.length,
            documents
        });

    } catch (error: any) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete document
 */
export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete from Firestore
        await db.collection(DOCUMENTS_COLLECTION).doc(id).delete();

        // Remove from signature queue if exists
        try {
            await db.collection(SIGNATURE_QUEUE_COLLECTION).doc(id).delete();
        } catch { }

        // Delete PDF file
        await deletePdf(id);

        res.json({ success: true, message: 'Document deleted' });

    } catch (error: any) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Remove document from signature queue (keep as draft)
 */
export const removeFromQueue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Update document status
        await db.collection(DOCUMENTS_COLLECTION).doc(id).update({
            status: 'draft',
            updatedAt: Timestamp.now(),
        });

        // Remove from queue
        await db.collection(SIGNATURE_QUEUE_COLLECTION).doc(id).delete();

        res.json({ success: true, message: 'Removed from signature queue' });

    } catch (error: any) {
        console.error('Error removing from queue:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Send document via WhatsApp or Email
 */
export const sendDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { via, recipient } = req.body as {
            via: 'whatsapp' | 'email';
            recipient: string; // phone or email
        };

        const doc = await db.collection(DOCUMENTS_COLLECTION).doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const data = doc.data() as DocumentMetadata;

        // Regenerate PDF
        const { pdfBuffer } = await compileToPdf(data.type, data.data);

        if (via === 'whatsapp') {
            // TODO: Integrate with WhatsApp API to send PDF
            // For now, just update status
            console.log(`Would send PDF to WhatsApp: ${recipient}`);
        } else if (via === 'email') {
            // TODO: Integrate with email service
            console.log(`Would send PDF to Email: ${recipient}`);
        }

        // Update document status
        await db.collection(DOCUMENTS_COLLECTION).doc(id).update({
            status: 'sent',
            sentAt: Timestamp.now(),
            sentVia: via,
            updatedAt: Timestamp.now(),
        });

        res.json({
            success: true,
            message: `Documento enviado via ${via}`,
        });

    } catch (error: any) {
        console.error('Error sending document:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Download document as PDF
 */
export const downloadDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const doc = await db.collection(DOCUMENTS_COLLECTION).doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const data = doc.data() as DocumentMetadata;

        // Regenerate PDF
        const { pdfBuffer } = await compileToPdf(data.type, data.data);

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${data.type}_${data.patientName.replace(/\s+/g, '_')}.pdf"`);

        res.send(pdfBuffer);

    } catch (error: any) {
        console.error('Error downloading document:', error);
        res.status(500).json({ error: error.message });
    }
};
