// src/services/firestore.ts
import { db } from '../config/firebaseAdmin.js';
const collection = db.collection('appointments');
export const getAllAppointments = async () => {
    const snapshot = await collection.get();
    const appointments = [];
    snapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
    });
    return appointments;
};
export const getAppointmentById = async (id) => {
    const doc = await collection.doc(id).get();
    if (!doc.exists)
        return null;
    return { id: doc.id, ...doc.data() };
};
export const createAppointment = async (data) => {
    const docRef = await collection.add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
};
export const updateAppointment = async (id, data) => {
    const docRef = collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists)
        return null;
    await docRef.update(data);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
};
export const deleteAppointment = async (id) => {
    const docRef = collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists)
        return false;
    await docRef.delete();
    return true;
};
export const getAppointmentsByDate = async (date) => {
    const snapshot = await collection.where('date', '==', date).get();
    const result = [];
    snapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() });
    });
    return result;
};
//# sourceMappingURL=firestore.js.map