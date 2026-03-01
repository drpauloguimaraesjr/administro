// src/services/firestore.ts
import { db } from '../config/firebaseAdmin.js';
import { Appointment } from '../shared/types/index.js';

const getCollection = () => {
    if (!db) throw new Error('Firebase not configured - set FIREBASE_SERVICE_ACCOUNT in .env');
    return db.collection('appointments');
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
    const snapshot = await getCollection().get();
    const appointments: Appointment[] = [];
    snapshot.forEach((doc: FirebaseFirestore.DocumentSnapshot) => {
        appointments.push({ id: doc.id, ...(doc.data() as any) });
    });
    return appointments;
};

export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
    const doc = await getCollection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as any) } as Appointment;
};

export const createAppointment = async (data: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const docRef = await getCollection().add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...(doc.data() as any) } as Appointment;
};

export const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<Appointment | null> => {
    const docRef = getCollection().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update(data);
    const updated = await docRef.get();
    return { id: updated.id, ...(updated.data() as any) } as Appointment;
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
    const docRef = getCollection().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
};

export const getAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
    const snapshot = await getCollection().where('date', '==', date).get();
    const result: Appointment[] = [];
    snapshot.forEach((doc: FirebaseFirestore.DocumentSnapshot) => {
        result.push({ id: doc.id, ...(doc.data() as any) });
    });
    return result;
};

// --- USERS ---
import { User, Intercurrence } from '../shared/types/index.js';
const getUsersCollection = () => {
    if (!db) throw new Error('Firebase not configured - set FIREBASE_SERVICE_ACCOUNT in .env');
    return db.collection('users');
};

export const getAllUsers = async (): Promise<User[]> => {
    const snapshot = await getUsersCollection().get();
    const users: User[] = [];
    snapshot.forEach(doc => {
        users.push({ id: doc.id, ...(doc.data() as any) });
    });
    return users;
};

export const getUserById = async (id: string): Promise<User | null> => {
    const doc = await getUsersCollection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as any) } as User;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const snapshot = await getUsersCollection().where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...(doc.data() as any) } as User;
};

export const createUser = async (data: Omit<User, 'id'>): Promise<User> => {
    // If it's a manual create, we might use add(), but often we want to use the Auth UID as doc ID.
    // For now, let's assume we use add() unless an ID is provided in a separate parameter logic.
    // However, to keep it simple and consistent:
    const docRef = await getUsersCollection().add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...(doc.data() as any) } as User;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User | null> => {
    const docRef = getUsersCollection().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update(data);
    const updated = await docRef.get();
    return { id: updated.id, ...(updated.data() as any) } as User;
};

export const deleteUser = async (id: string): Promise<boolean> => {
    const docRef = getUsersCollection().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
};

// --- INTERCURRENCES ---
const getIntercurrencesCollection = () => {
    if (!db) throw new Error('Firebase not configured - set FIREBASE_SERVICE_ACCOUNT in .env');
    return db.collection('intercurrences');
};

export const getOpenIntercurrences = async (): Promise<Intercurrence[]> => {
    const snapshot = await getIntercurrencesCollection().where('status', '!=', 'resolved').get();
    const items: Intercurrence[] = [];
    snapshot.forEach(doc => {
        items.push({ id: doc.id, ...(doc.data() as any) });
    });
    return items;
};

export const createIntercurrence = async (data: Omit<Intercurrence, 'id'>): Promise<Intercurrence> => {
    const docRef = await getIntercurrencesCollection().add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...(doc.data() as any) } as Intercurrence;
};

export const updateIntercurrence = async (id: string, data: Partial<Intercurrence>): Promise<Intercurrence | null> => {
    const docRef = getIntercurrencesCollection().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update(data);
    const updated = await docRef.get();
    return { id: updated.id, ...(updated.data() as any) } as Intercurrence;
};
