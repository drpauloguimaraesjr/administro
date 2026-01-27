/**
 * Tipos compartilhados entre Frontend e Backend
 * Mantém consistência na comunicação entre as partes do sistema
 */
export const ROLE_PERMISSIONS = {
    owner: [
        { module: 'patients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'appointments', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'medical_records', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'prescriptions', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'financial', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'crm', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'whatsapp', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'reports', actions: ['view', 'export'] },
        { module: 'settings', actions: ['view', 'edit'] },
        { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'knowledge', actions: ['view', 'create', 'edit', 'delete', 'export'] }
    ],
    doctor: [
        { module: 'patients', actions: ['view', 'create', 'edit'] },
        { module: 'appointments', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'medical_records', actions: ['view', 'create', 'edit'] },
        { module: 'prescriptions', actions: ['view', 'create', 'edit'] },
        { module: 'financial', actions: ['view'] },
        { module: 'crm', actions: ['view', 'create', 'edit'] },
        { module: 'whatsapp', actions: ['view', 'create'] },
        { module: 'reports', actions: ['view'] },
        { module: 'knowledge', actions: ['view', 'create', 'edit', 'delete'] }
    ],
    receptionist: [
        { module: 'patients', actions: ['view', 'create', 'edit'] },
        { module: 'appointments', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'financial', actions: ['view', 'create', 'edit'] },
        { module: 'whatsapp', actions: ['view', 'create'] },
        { module: 'crm', actions: ['view', 'create', 'edit'] }
    ]
};
//# sourceMappingURL=index.js.map