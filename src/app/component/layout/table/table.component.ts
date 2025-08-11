import { Component, HostListener, OnInit } from '@angular/core';
import { DataService } from '../../../service/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type StatusId = 'todo' | 'in-progress' | 'done';

const STATUS_META: Record<StatusId, { label: string; dot: string }> = {
  'todo': { label: 'Todo', dot: 'bg-sky-500' },
  'in-progress': { label: 'En progreso', dot: 'bg-amber-500' },
  'done': { label: 'Completado', dot: 'bg-emerald-500' }
};

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  tasks: any[] = [];

  // edición inline
  editingTaskId: string | null = null;
  inputValue = '';
  editionIndex: number | null = null;

  // búsqueda
  filtrarClave = '';

  // menús
  openActionsForId: string | null = null;
  openStatusForId: string | null = null;

  constructor(private _dataService: DataService) { }

  ngOnInit(): void {
    this._dataService.data$.subscribe(data => {
      const now = Date.now();
      this.tasks = (data ?? []).map(t => {
        const status: StatusId = this.toId(t.status);
        // Backfill de timestamps si venían de Board sin createdAt/updatedAt:
        const createdAt =
          typeof t.createdAt === 'number' ? t.createdAt :
            (t.createdDate ? this.parseEsDate(t.createdDate) : now);

        const updatedAt =
          typeof t.updatedAt === 'number' ? t.updatedAt : createdAt;

        return { ...t, status, createdAt, updatedAt };
      });
    });
  }

  private parseEsDate(s: string): number {
    try {
      const meses: Record<string, number> = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
        'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      };
      const m = s.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóú]+)/i);
      if (!m) return Date.now();
      const dia = parseInt(m[1], 10);
      const mes = meses[m[2]] ?? (new Date().getMonth());
      const y = new Date().getFullYear();
      return new Date(y, mes, dia).getTime();
    } catch { return Date.now(); }
  }

  filtrarOrdenado(): any[] {
    const q = this.filtrarClave.trim().toLowerCase();
    const base = q ? this.tasks.filter(t => t.text?.toLowerCase().includes(q)) : [...this.tasks];

    // helpers: si no hay timestamp, que cuente como -∞ para no subir
    const U = (x: any) => (typeof x.updatedAt === 'number' ? x.updatedAt : Number.NEGATIVE_INFINITY);
    const C = (x: any) => (typeof x.createdAt === 'number' ? x.createdAt : Number.NEGATIVE_INFINITY);

    // DESC por updatedAt (más reciente primero). Empate -> DESC por createdAt
    return base.sort((a, b) => {
      const byUpdated = U(b) - U(a);
      if (byUpdated !== 0) return byUpdated;
      return C(b) - C(a);
    });
  }



  private toId(s: any): StatusId {
    const k = String(s || '').toLowerCase().replace(/\s+/g, '-');
    return (k === 'in-progress' || k === 'done' || k === 'todo') ? (k as StatusId) : 'todo';
  }

  // ---------- edición ----------
  enableInput(task: any, index: number): void {
    this.editingTaskId = task.id;
    this.inputValue = task.text;
    this.editionIndex = index;
  }

  labelOf(s: any): string {
    return STATUS_META[this.toId(s)].label;
  }

  dotClassOf(s: any): string {
    return STATUS_META[this.toId(s)].dot;
  }

  isDone(s: any): boolean {
    return this.toId(s) === 'done';
  }


  cancelar(_: any): void {
    this.editingTaskId = null;
    this.inputValue = '';
    this.editionIndex = null;
  }

  editar(task: any): void {
    const text = this.inputValue.trim();
    if (!text) return;
    this._dataService.updateData({ ...task, text, updatedAt: Date.now() });
    this.cancelar(task);
  }

  toggleStatusMenu(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.openStatusForId = this.openStatusForId === id ? null : id;
    this.openActionsForId = null;
  }

  updateStatus(task: any, status: StatusId) {
    this._dataService.updateData({ ...task, status, updatedAt: Date.now() });
    this.openStatusForId = null;
  }

  toggleActionsMenu(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.openActionsForId = this.openActionsForId === id ? null : id;
    this.openStatusForId = null;
  }

  deleteTask(task: any) {
    this._dataService.deleteTask(task);
    this.closeMenus();
  }

  closeMenus() {
    this.openActionsForId = null;
    this.openStatusForId = null;
  }

  @HostListener('document:click') onDocClick() {
    this.closeMenus();
  }

  filtrarDatos(): any[] {
    const q = this.filtrarClave.trim().toLowerCase();
    return q ? this.tasks.filter(t => t.text?.toLowerCase().includes(q)) : this.tasks;
  }
};