
import { Router } from 'express';
import { UsersService } from '../services/users.service.js';

const router = Router();

// Listar todos
router.get('/', async (req, res) => {
    try {
        const users = await UsersService.getAll();
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar por ID
router.get('/:id', async (req, res) => {
    try {
        const user = await UsersService.getById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Criar novo
router.post('/', async (req, res) => {
    try {
        const user = await UsersService.create(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        console.error('Erro ao criar usuário:', error);
        res.status(400).json({ error: error.message });
    }
});

// Atualizar
router.put('/:id', async (req, res) => {
    try {
        const user = await UsersService.update(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Excluir
router.delete('/:id', async (req, res) => {
    try {
        await UsersService.delete(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Resetar Senha
router.post('/:id/reset-password', async (req, res) => {
    try {
        const link = await UsersService.resetPassword(req.params.id);
        res.json({ message: 'Link de reset gerado', link });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const usersRouter = router;
