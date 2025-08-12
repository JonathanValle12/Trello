import { CoreStatusId } from './task.model';

export interface Column {
  id: string;
  title: string;
  description: string;
  color: string;
  isCore?: boolean;
}

export const CORE_COLUMNS: Column[] = [
  {
    id: 'todo' as CoreStatusId,
    title: 'Por hacer',
    color: '#0ea5e9',
    description: 'Tareas pendientes por iniciar',
    isCore: true
  },
  {
    id: 'in-progress' as CoreStatusId,
    title: 'En progreso',
    color: '#f59e0b',
    description: 'Tareas actualmente en desarrollo',
    isCore: true
  },
  {
    id: 'done' as CoreStatusId,
    title: 'Completadas',
    color: '#10b981',
    description: 'Tareas finalizadas',
    isCore: true
  }
];
