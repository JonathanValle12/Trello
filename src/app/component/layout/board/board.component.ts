import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { DataService } from '../../../service/data.service';
import { ModalComponent } from '../../modal/modal.component';

type Task = { id: string; text: string; createdDate?: string; status: string };
type Column = {
  id: string;
  title: string;
  color: string;
  description: string;
  isCore?: boolean;
};

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, ModalComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {

  newColumnName = '';
  newColumnColor = '#94a3b8';
  newColumnDescription = 'Nueva columna de tareas';

  columns: Column[] = [];
  private columnsKey = 'columns';

  tasks: Task[] = [];

  selectedTaskId: string | null = null;
  openColumnMenuId: string | null = null;

  addingForId: string | null = null;
  newTaskTitle = '';

  showNewColumnForm = false;

  modal = false;
  selectedTask!: Task;

  editingColumnId: string | null = null;
  private prevColSnapshot: { id: string; title: string; description: string; color: string } | null = null;

  constructor(private el: ElementRef, private data: DataService) { }

  private normalizeColor(c: string): string {
    const map: Record<string, string> = {
      'sky-500': '#0ea5e9',
      'amber-500': '#f59e0b',
      'emerald-500': '#10b981',
      'slate-400': '#94a3b8'
    };
    return c?.startsWith('#') ? c : (map[c] ?? '#94a3b8');
  }

  ngOnInit(): void {
    this.loadColumns();
    this.ensureCoreColumns();
    this.data.data$.subscribe(all => this.tasks = all ?? []);
  }

  private readonly CORE_COLUMNS: Column[] = [
    { id: 'todo', title: 'Todo', color: '#0ea5e9', description: 'Tareas pendientes por iniciar', isCore: true },
    { id: 'in-progress', title: 'En progreso', color: '#f59e0b', description: 'Se está trabajando activamente en esto', isCore: true },
    { id: 'done', title: 'Completado', color: '#10b981', description: 'Esto se ha completado', isCore: true },
  ];

  private ensureCoreColumns() {
    const existing = new Set(this.columns.map(c => c.id));
    let changed = false;
    for (const base of this.CORE_COLUMNS) {
      if (!existing.has(base.id)) { this.columns.unshift({ ...base }); changed = true; }
    }
    for (const col of this.columns) {
      if (this.CORE_COLUMNS.some(c => c.id === col.id) && !col.isCore) { col.isCore = true; changed = true; }
    }
    if (changed) this.saveColumns();
  }

  private loadColumns() {
    const saved = localStorage.getItem(this.columnsKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      this.columns = parsed.map((c: any) => ({ ...c, color: this.normalizeColor(c.color) }));
    } else {
      this.columns = [...this.CORE_COLUMNS];
      this.saveColumns();
    }
  }

  dropColumn(event: CdkDragDrop<Column[]>) {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.saveColumns();
  }

  public saveColumns() { localStorage.setItem(this.columnsKey, JSON.stringify(this.columns)); }

  get dropListIds(): string[] { return this.columns.map(c => c.id); }

  private matchesColumn(t: Task, c: Column): boolean {
    const map: Record<string, string> = { 'todo': 'Todo', 'in-progress': 'In Progress', 'done': 'Done' };
    return t.status === c.id || t.status === c.title || t.status === map[c.id];
  }
  tasksOf(col: Column): Task[] { return this.tasks.filter(t => this.matchesColumn(t, col)); }

  addColumn() {
    const name = this.newColumnName.trim();
    if (!name) return;

    let slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    if (!slug) slug = `col-${Date.now()}`;
    const base = slug; let i = 1;
    while (this.columns.some(c => c.id === slug)) slug = `${base}-${i++}`;

    this.columns.push({
      id: slug,
      title: name,
      color: this.newColumnColor,
      description: this.newColumnDescription || 'Nueva columna de tareas'
    });
    this.saveColumns();

    this.newColumnName = '';
    this.newColumnColor = '#94a3b8';
    this.newColumnDescription = 'Nueva columna de tareas';
    this.showNewColumnForm = false;
  }

  renameColumn(col: Column) {
    this.prevColSnapshot = { id: col.id, title: col.title, description: col.description, color: col.color };
    this.editingColumnId = col.id;
    this.openColumnMenuId = null;
    queueMicrotask(() => {
      const el = document.getElementById(`col-input-${col.id}`) as HTMLInputElement | null;
      el?.focus(); el?.select();
    });
  }

  commitColumnInline() {
    this.saveColumns();
    this.editingColumnId = null;
    this.prevColSnapshot = null;
  }

  cancelColumnInline() {
    if (this.prevColSnapshot) {
      const c = this.columns.find(x => x.id === this.prevColSnapshot!.id);
      if (c) {
        c.title = this.prevColSnapshot.title;
        c.description = this.prevColSnapshot.description;
        c.color = this.prevColSnapshot.color;
      }
    }
    this.editingColumnId = null;
    this.prevColSnapshot = null;
  }

  deleteColumn(col: Column) {
    if (col.isCore) return;
    const toDelete = this.tasks.filter(t => this.matchesColumn(t, col));
    toDelete.forEach(t => this.data.deleteTask(t));
    this.columns = this.columns.filter(c => c.id !== col.id);
    this.saveColumns();
  }

  startAdd(colId: string) { this.addingForId = colId; this.newTaskTitle = ''; }
  cancelAdd() { this.addingForId = null; this.newTaskTitle = ''; }

  addTask(colId: string) {
    const text = this.newTaskTitle.trim();
    if (!text) return;
    const task: Task = {
      id: uuidv4(),
      text,
      createdDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long' }),
      status: colId
    };
    this.data.addData(task);
    this.cancelAdd();
  }

  onTaskDrop(ev: CdkDragDrop<Task[]>) {
    const task: Task = ev.item.data;
    const targetColId = ev.container.id;
    if (task.status !== targetColId) this.data.updateData({ ...task, status: targetColId });
  }

  openMenu(taskId: string, e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.selectedTaskId = this.selectedTaskId === taskId ? null : taskId;
  }
  closeMenu() { this.selectedTaskId = null; }

  toggleColMenu(id: string, e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.openColumnMenuId = this.openColumnMenuId === id ? null : id;
  }
  closeColMenus() { this.openColumnMenuId = null; }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;

    const taskMenu = this.el.nativeElement.querySelector('.ctx-menu');
    const taskBtn = this.el.nativeElement.querySelector('.ctx-btn');
    if (taskMenu && !taskMenu.contains(target) && taskBtn && !taskBtn.contains(target)) this.closeMenu();

    const colMenu = this.el.nativeElement.querySelector('.col-menu');
    if (colMenu && !colMenu.contains(target)) this.closeColMenus();

    if (this.editingColumnId) {
      const header = document.getElementById(`col-header-${this.editingColumnId}`);
      if (header && !header.contains(target)) {
        this.commitColumnInline();
      }
    }
  }

  openModal(task: Task) { this.modal = true; this.selectedTask = task; this.closeMenu(); }
  deleteTask(task: Task) { this.modal = false; this.data.deleteTask(task); this.closeMenu(); }

  trackCol(_: number, c: Column) { return c.id; }
  trackById(_: number, t: Task) { return t.id; }
}