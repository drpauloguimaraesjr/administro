// src/services/firestore.ts
import { db } from '../config/firebaseAdmin.js';
import { Appointment } from '../shared/types/index.js';

const collection = db.collection('appointments');

export const getAllAppointments = async (): Promise<Appointment[]> => {
    const snapshot = await collection.get();
    const appointments: Appointment[] = [];
    snapshot.forEach((doc: FirebaseFirestore.DocumentSnapshot) => {
        appointments.push({ id: doc.id, ...(doc.data() as any) });
    });
    return appointments;
};

export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as any) } as Appointment;
};

export const createAppointment = async (data: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const docRef = await collection.add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...(doc.data() as any) } as Appointment;
};

export const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<Appointment | null> => {
    const docRef = collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update(data);
    const updated = await docRef.get();
    return { id: updated.id, ...(updated.data() as any) } as Appointment;
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
    const docRef = collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
};

export const getAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
    const snapshot = await collection.where('date', '==', date).get();
    const result: Appointment[] = [];
    snapshot.forEach((doc: FirebaseFirestore.DocumentSnapshot) => {
        result.push({ id: doc.id, ...(doc.data() as any) });
    });
    return result;
};
