import { Component, HostListener, OnInit } from '@angular/core';
import { DataService } from '../../../service/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Status = 'Todo' | 'In Progress' | 'Done';

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

  constructor(private _dataService: DataService) {}

  ngOnInit(): void {
    this._dataService.data$.subscribe(data => this.tasks = data);
  }

  // ---------- edición ----------
  enableInput(task: any, index: number): void {
    this.editingTaskId = task.id;
    this.inputValue = task.text;
    this.editionIndex = index;
  }

  cancelar(_: any): void {
    this.editingTaskId = null;
    this.inputValue = '';
    this.editionIndex = null;
  }

  editar(task: any): void {
    const text = this.inputValue.trim();
    if (!text) return;
    this._dataService.updateData({ ...task, text });
    this.cancelar(task);
  }

  // ---------- estado ----------
  toggleStatusMenu(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.openStatusForId = this.openStatusForId === id ? null : id;
    this.openActionsForId = null;
  }

  updateStatus(task: any, status: Status) {
    this._dataService.updateData({ ...task, status });
    this.openStatusForId = null;
  }

  // ---------- acciones ----------
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

  // Cerrar menús al clicar fuera
  @HostListener('document:click') onDocClick() {
    this.closeMenus();
  }

  // ---------- filtro ----------
  filtrarDatos(): any[] {
    const q = this.filtrarClave.trim().toLowerCase();
    return q ? this.tasks.filter(t => t.text?.toLowerCase().includes(q)) : this.tasks;
  }
};