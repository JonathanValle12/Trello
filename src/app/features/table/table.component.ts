import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { ColumnService } from '../../core/services/column.service';
import { STATUS_META, CoreStatusId } from '../../core/models/task.model';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {

  tasks: any[] = [];
  filter = '';

  // edición inline
  editingTaskId: string | null = null;
  inputValue = '';
  openActionsForId: string | null = null;
  openStatusForId: string | null = null;

  constructor(
    private readonly tasksSvc: TaskService,
    private readonly columnsSvc: ColumnService
  ) {
    // Suscripción simple al estado de tareas
    this.tasksSvc.tasks$.subscribe(list => this.tasks = list ?? []);
  }

  get ordered(): Task[] {
    // Orden: actualizar la mas reciente, luego crea la mas reciente
    const base = this.filtered(this.tasks);
    return base.sort((a, b) =>
      (b.updatedAt ?? 0) - (a.updatedAt ?? 0) ||
      (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
  }

  filtered(list: Task[]): Task[] {
    const q = this.filter.trim().toLowerCase();
    return q ? list.filter(t => t.text.toLowerCase().includes(q)) : list;
  }

  labelOf(status: string): string {
    // Core usa diccionario, si es columna custon, pide el título al ColumnService
    const core = STATUS_META[status as CoreStatusId]?.label;
    if (core) return core;
    return this.columnsSvc.titleOf(status) ?? status;
  }

  dotClassOf(status: string): string {
    const core = STATUS_META[status as CoreStatusId]?.dotClass;
    return core ?? 'bg-slate-400';
  }

  enableInput(t: Task) { this.editingTaskId = t.id; this.inputValue = t.text};
  cancelar() { this.editingTaskId = null; this.inputValue = ''};
  editar(t: Task) {
    const text = this.inputValue.trim();
    if (!text) return;
    this.tasksSvc.updateText(t.id, text);
    this.cancelar();
  }

  toggleStatusMenu(id: string, e: MouseEvent) {
    e.stopPropagation();
    // Asegura un menú abierto a la vez
    this.openStatusForId = this.openStatusForId === id ? null : id;
    this.openActionsForId = null;
  }

  updateStatus(t: Task, status: string) {
    this.tasksSvc.updateStatus(t.id, status);
    this.openStatusForId = null;
  }

  toggleActionsMenu(id: string, e: MouseEvent) { e.stopPropagation(); this.openActionsForId = this.openActionsForId === id ? null : id; this.openStatusForId = null; }
  deleteTask(t: Task) { this.tasksSvc.delete(t.id); this.closeMenus(); }
  closeMenus() { this.openActionsForId = null; this.openStatusForId = null; }
};