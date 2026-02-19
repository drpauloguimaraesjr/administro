'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Shield, User } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserForm } from '@/components/admin/user-form';
import { UserList } from '@/components/admin/user-list';

interface SystemUser {
  id?: string;
  email: string;
  name: string;
  role: 'owner' | 'spouse' | 'secretary';
  active: boolean;
  createdAt?: Date | string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: SystemUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          active: data.active !== false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        });
      });
      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-6">Carregando...</div>;
  }

  return (
    <div className="px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Administração</h1>
            <p className="text-muted-foreground">Gerencie usuários do sistema</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UserForm onClose={() => setShowForm(false)} />
          </motion.div>
        )}

        {/* Users List */}
        <UserList users={users} />
      </div>
    </div>
  );
}

