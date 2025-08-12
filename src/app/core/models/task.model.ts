export type CoreStatusId = 'todo' | 'in-progress' | 'done';
export type StatusId = CoreStatusId | string;

export interface Task {
    id: string;
    text: string;
    status: StatusId;
    createdAt: number;
    updatedAt: number;
}

export const STATUS_META: Record<StatusId, { label: string; dotClass: string}> = {
    'todo': { label: 'Todo', dotClass: '#0ea5e9'},
    'in-progress': { label: 'En progreso', dotClass: '#f59e0b' },
    'done': { label: 'Completado', dotClass: '#10b981' }
}