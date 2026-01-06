'use client';

import { motion } from 'framer-motion';
import { Trash2, Edit, Shield, User, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase/config';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { UserForm } from './user-form';

interface SystemUser {
  id?: string;
  email: string;
  name: string;
  role: 'owner' | 'spouse' | 'secretary';
  active: boolean;
  createdAt?: Date | string;
}

interface UserListProps {
  users: SystemUser[];
}

export function UserList({ users }: UserListProps) {
  const [editingUser, setEditingUser] = useState<SystemUser | undefined>();

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const handleToggleActive = async (user: SystemUser) => {
    if (!db || !user.id) return;

    try {
      await updateDoc(doc(db, 'users', user.id), {
        active: !user.active,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    }
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum usuário cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {editingUser && (
        <UserForm
          initialData={editingUser}
          onClose={() => setEditingUser(undefined)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user, index) => (
          <motion.div
            key={user.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={user.active ? '' : 'opacity-60'}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        user.role === 'owner' 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : user.role === 'spouse'
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                      }`}>
                        {user.role === 'owner' ? (
                          <Shield className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.active
                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    }`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Role */}
                  <div>
                    <span className="text-sm text-muted-foreground">Perfil: </span>
                    <span className="text-sm font-medium capitalize">
                      {user.role === 'owner' ? 'Proprietário' : 
                       user.role === 'spouse' ? 'Cônjuge' : 'Secretária'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(user)}
                      className="flex-1"
                    >
                      {user.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => user.id && handleDelete(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

