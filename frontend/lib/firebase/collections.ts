import { collection, Firestore } from 'firebase/firestore';
import { db } from './config';

export const prescriptionFormulasCollection = collection(db as Firestore, 'prescription_formulas');
