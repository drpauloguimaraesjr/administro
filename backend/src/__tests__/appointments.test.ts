// src/__tests__/appointments.test.ts
import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import appointmentsRoutes from '../routes/appointments';

let app: Express;

beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/appointments', appointmentsRoutes);
});

describe('Appointments API', () => {
    let createdId: string;

    it('should create an appointment', async () => {
        const res = await request(app)
            .post('/api/appointments')
            .send({
                patientId: 'p1',
                patientName: 'John Doe',
                date: '2026-02-01',
                startTime: '10:00',
                endTime: '10:30',
                duration: 30,
                type: 'first_visit',
                status: 'pending',
            });
        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        createdId = res.body.id;
    });

    it('should list appointments', async () => {
        const res = await request(app).get('/api/appointments');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should update the appointment', async () => {
        const res = await request(app)
            .put(`/api/appointments/${createdId}`)
            .send({ status: 'confirmed' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('confirmed');
    });

    it('should delete the appointment', async () => {
        const res = await request(app).delete(`/api/appointments/${createdId}`);
        expect(res.status).toBe(204);
    });
});
