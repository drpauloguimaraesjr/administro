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
const usersCollection = db.collection('users');
export const getAllUsers = async () => {
    const snapshot = await usersCollection.get();
    const users = [];
    snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
    });
    return users;
};
export const getUserById = async (id) => {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists)
        return null;
    return { id: doc.id, ...doc.data() };
};
export const getUserByEmail = async (email) => {
    const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
    if (snapshot.empty)
        return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
};
export const createUser = async (data) => {
    // If it's a manual create, we might use add(), but often we want to use the Auth UID as doc ID.
    // For now, let's assume we use add() unless an ID is provided in a separate parameter logic.
    // However, to keep it simple and consistent:
    const docRef = await usersCollection.add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
};
export const updateUser = async (id, data) => {
    const docRef = usersCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists)
        return null;
    await docRef.update(data);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
};
export const deleteUser = async (id) => {
    const docRef = usersCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists)
        return false;
    await docRef.delete();
    return true;
};
// --- INTERCURRENCES ---
const intercurrencesCollection = db.collection('intercurrences');
export const getOpenIntercurrences = async () => {
    const snapshot = await intercurrencesCollection.where('status', '!=', 'resolved').get();
    const items = [];
    snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
    });
    return items;
};
export const createIntercurrence = async (data) => {
    const docRef = await intercurrencesCollection.add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
};
export const updateIntercurrence = async (id, data) => {
    const docRef = intercurrencesCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists)
        return null;
    await docRef.update(data);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
};
//# sourceMappingURL=firestore.js.map