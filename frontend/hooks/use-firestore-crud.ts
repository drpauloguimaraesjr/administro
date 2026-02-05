'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';

export interface BaseDocument {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function useFirestoreCrud<T extends BaseDocument>(
  collectionName: string,
  orderByField: string = 'createdAt'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!db) {
      setError('Firebase não configurado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const constraints: QueryConstraint[] = [];
      
      // Try to order by field, fallback if field doesn't exist
      try {
        constraints.push(orderBy(orderByField, 'desc'));
      } catch {
        // Field might not exist yet
      }

      const q = constraints.length > 0 
        ? query(collection(db, collectionName), ...constraints)
        : collection(db, collectionName);
        
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          createdAt: docData.createdAt?.toDate?.() || docData.createdAt,
          updatedAt: docData.updatedAt?.toDate?.() || docData.updatedAt,
        } as T;
      });
      setData(items);
      setError(null);
    } catch (err: any) {
      console.error('Firestore fetch error:', err);
      setError(err.message);
      // Still try to fetch without ordering
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as T));
        setData(items);
      } catch {
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [collectionName, orderByField]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const create = async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    if (!db) {
      toast.error('Firebase não configurado');
      return null;
    }

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      toast.success('Registro criado com sucesso!');
      await fetchData();
      return docRef.id;
    } catch (err: any) {
      console.error('Firestore create error:', err);
      toast.error('Erro ao criar: ' + err.message);
      return null;
    }
  };

  const update = async (id: string, item: Partial<T>): Promise<boolean> => {
    if (!db) {
      toast.error('Firebase não configurado');
      return false;
    }

    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...item,
        updatedAt: Timestamp.now(),
      });
      toast.success('Registro atualizado com sucesso!');
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Firestore update error:', err);
      toast.error('Erro ao atualizar: ' + err.message);
      return false;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    if (!db) {
      toast.error('Firebase não configurado');
      return false;
    }

    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success('Registro removido com sucesso!');
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Firestore delete error:', err);
      toast.error('Erro ao remover: ' + err.message);
      return false;
    }
  };

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    create,
    update,
    remove,
  };
}
