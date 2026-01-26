import { Router } from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/usersController.js';

const router = Router();

// Public/Private logic to be added later with middleware
// For now, assuming internal network or basic auth implemented elsewhere

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
