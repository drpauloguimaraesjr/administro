/**
 * Autenticação Firebase
 */

import { auth } from './firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

export async function login(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth não está configurado');
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function register(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth não está configurado');
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  if (!auth) throw new Error('Firebase Auth não está configurado');
  return await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth?.currentUser || null;
}

