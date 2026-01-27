import { z } from 'zod';
import { createUser as createUserDb, getAllUsers, getUserById, updateUser as updateUserDb, deleteUser as deleteUserDb, getUserByEmail } from '../services/firestore.js';
// Schema Validation
const userSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    role: z.enum(['master', 'doctor', 'nurse', 'receptionist', 'owner', 'spouse', 'secretary', 'admin']),
    permissions: z.array(z.string()).default([]),
    specialty: z.string().optional(),
    phone: z.string().optional(),
    isActive: z.boolean().default(true),
    contexts: z.array(z.enum(['HOME', 'CLINIC', 'OVERVIEW'])).default(['CLINIC']),
});
export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await getUserById(id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const createUser = async (req, res) => {
    const parse = userSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parse.error.errors });
    }
    try {
        // Check duplication
        const existing = await getUserByEmail(parse.data.email);
        if (existing) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        const newUserSearchData = {
            ...parse.data,
            createdAt: new Date().toISOString(),
        };
        // Force type cast because Zod enum vs UserRole type might mismatch slightly if not perfectly aligned
        // but here they are aligned.
        const created = await createUserDb(newUserSearchData);
        res.status(201).json(created);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const parse = userSchema.partial().safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parse.error.errors });
    }
    try {
        const updated = await updateUserDb(id, parse.data);
        if (!updated)
            return res.status(404).json({ error: 'User not found' });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await deleteUserDb(id);
        if (!success)
            return res.status(404).json({ error: 'User not found' });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
//# sourceMappingURL=usersController.js.map