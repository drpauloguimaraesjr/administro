'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface SystemUser {
  id?: string;
  email: string;
  name: string;
  role: 'owner' | 'spouse' | 'secretary';
  active: boolean;
}

interface UserFormProps {
  onClose: () => void;
  initialData?: SystemUser;
}

export function UserForm({ onClose, initialData }: UserFormProps) {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    name: initialData?.name || '',
    role: (initialData?.role || 'spouse') as 'owner' | 'spouse' | 'secretary',
    active: initialData?.active !== false,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !auth) {
      setError('Firebase não está configurado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (initialData?.id) {
        // Atualizar usuário existente
        await updateDoc(doc(db, 'users', initialData.id), {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          active: formData.active,
          updatedAt: new Date(),
        });
      } else {
        // Criar novo usuário
        if (!formData.password) {
          setError('Senha é obrigatória para novos usuários');
          setLoading(false);
          return;
        }

        // Criar no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Criar documento no Firestore
        await addDoc(collection(db, 'users'), {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          active: formData.active,
          uid: userCredential.user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{initialData ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="text-sm font-medium mb-2 block">Nome</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Julia"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="julia@email.com"
              required
            />
          </div>

          {/* Senha (apenas para novos usuários) */}
          {!initialData && (
            <div>
              <label className="text-sm font-medium mb-2 block">Senha</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required={!initialData}
                minLength={6}
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className="text-sm font-medium mb-2 block">Perfil</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="owner">Proprietário</option>
              <option value="spouse">Cônjuge</option>
              <option value="secretary">Secretária</option>
            </select>
          </div>

          {/* Ativo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="active" className="text-sm font-medium">
              Usuário ativo (pode fazer login)
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

