import { Request, Response, Router } from 'express';
import admin from 'firebase-admin';

const db = admin.firestore();
const router = Router();

router.get('/chats', async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection('crm_chats')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        let chats: any[] = [];
        snapshot.forEach(doc => {
            chats.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(chats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
