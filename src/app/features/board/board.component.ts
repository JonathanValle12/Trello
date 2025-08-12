import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { take } from 'rxjs/operators';

import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Task } from '../../core/models/task.model';
import { Column } from '../../core/models/column.model';
import { TaskService } from '../../core/services/task.service';
import { ColumnService } from '../../core/services/column.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, ModalComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {

  columns$ = this.columnsSvc.columns$;
  tasks$ = this.tasksSvc.tasks$;

  selectedTaskId: string | null = null;
  openColumnMenuId: string | null = null;
  addingForId: string | null = null;

  modal = false;
  selectedTask!: Task;

  newTaskTitle = '';

  showNewColumnForm = false;
  newColumnName = '';
  newColumnColor = '#94a3b8';
  newColumnDescription = 'Nueva columna de tareas';

  editingColumnId: string | null = null;
  editTitle = '';
  editDesc = '';
  editColor = '#94a3b8';

  constructor(
    private readonly el: ElementRef,
    private readonly tasksSvc: TaskService,
    private readonly columnsSvc: ColumnService
  ) { }

  onDropColumns(e: CdkDragDrop<Column[]>) {
    if (e.previousIndex !== e.currentIndex) this.columnsSvc.reorder(e.previousIndex, e.currentIndex);
  }
  onTaskDrop(e: CdkDragDrop<Task[]>) {
    // Solo actualiza si cambió de columna (evita writes innecesarios)
    const task: Task = e.item.data;
    const targetColId = e.container.id as string;
    if (task.status !== targetColId) this.tasksSvc.updateStatus(task.id, targetColId);
  }
  connectedTo(cols: Column[]): string[] { return cols.map(c => c.id); }
  tasksOf(col: Column, list: Task[]) { return list.filter(t => t.status === col.id); }

  addColumn() {
    const title = this.newColumnName.trim();
    if (!title) return;
    this.columnsSvc.add({
      title,
      description: this.newColumnDescription || 'Nueva columna de tareas',
      color: this.newColumnColor
    });
    this.resetNewColumn();
  }
  renameColumn(col: Column) {
    this.openColumnMenuId = null;
    this.editingColumnId = col.id;
    this.editTitle = col.title;
    this.editDesc = col.description ?? '';
    this.editColor = col.color;

    // Foco tras el siguiente microtask para asegurar que el input ya está en DOM
    queueMicrotask(() => {
      (document.getElementById(`col-input-${col.id}`) as HTMLInputElement | null)?.focus();
      (document.getElementById(`col-input-${col.id}`) as HTMLInputElement | null)?.select();
    });
  }
  commitColumnInline() {
    if (!this.editingColumnId) return;

    // Lee columna actual y aplica cambio. Respeta título bloqueado si es core
    this.columns$.pipe(take(1)).subscribe(cols => {
      const col = cols.find(c => c.id === this.editingColumnId);
      if (!col) return;
      const partial: Partial<Column> = {
        description: this.editDesc,
        color: this.editColor,
      };
      if (!col.isCore) partial.title = this.editTitle;

      this.columnsSvc.update(col.id, partial);
      this.resetEdit();
    });
  }
  cancelColumnInline() { this.resetEdit(); }
  deleteColumn(col: Column) { this.openColumnMenuId = null; this.columnsSvc.delete(col.id); }

  // Tareas
  startAdd(colId: string) { this.addingForId = colId; this.newTaskTitle = ''; }
  cancelAdd() { this.addingForId = null; this.newTaskTitle = ''; }
  addTask(colId: string) {
    const text = this.newTaskTitle.trim();
    if (!text) return;
    const now = Date.now();
    // Nota: uuid, status y timestamps; TaskService vuelve a setear updatedAt al upsert
    this.tasksSvc.add({ id: uuidv4(), text, status: colId, createdAt: now, updatedAt: now } as any);
    this.cancelAdd();
  }

  openMenu(taskId: string, e?: MouseEvent) { e?.stopPropagation(); this.selectedTaskId = this.selectedTaskId === taskId ? null : taskId; }
  closeMenu() { this.selectedTaskId = null; }
  toggleColMenu(id: string, e?: MouseEvent) { e?.stopPropagation(); this.openColumnMenuId = this.openColumnMenuId === id ? null : id; }
  closeColMenus() { this.openColumnMenuId = null; }
  openModal(task: Task) { this.modal = true; this.selectedTask = task; this.closeMenu(); }
  deleteTask(task: Task) { this.modal = false; this.tasksSvc.delete(task.id); this.closeMenu(); }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    // Cierra menús al hacer click fuera (usa primeros .querySelector, y si hay múltiples, considera usar closest en el template)
    const target = ev.target as HTMLElement;

    const taskMenu = this.el.nativeElement.querySelector('.ctx-menu');
    const taskBtn = this.el.nativeElement.querySelector('.ctx-btn');
    if (taskMenu && !taskMenu.contains(target) && taskBtn && !taskBtn.contains(target)) this.closeMenu();

    const colMenu = this.el.nativeElement.querySelector('.col-menu');
    if (colMenu && !colMenu.contains(target)) this.closeColMenus();

    if (this.editingColumnId) {
      const header = document.getElementById(`col-header-${this.editingColumnId}`);
      if (header && !header.contains(target)) this.commitColumnInline();
    }
  }

  trackCol(_: number, c: Column) { return c.id; }
  trackById(_: number, t: Task) { return t.id; }

  private resetNewColumn() {
    this.newColumnName = '';
    this.newColumnColor = '#94a3b8';
    this.newColumnDescription = 'Nueva columna de tareas';
    this.showNewColumnForm = false;
  }
  private resetEdit() {
    this.editingColumnId = null;
    this.editTitle = '';
    this.editDesc = '';
    this.editColor = '#94a3b8';
  }
}
