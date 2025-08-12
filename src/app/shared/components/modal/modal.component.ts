import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StatusId, Task, STATUS_META } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnChanges {

  @Input() visible = false
  @Input() task!: Task;
  @Output() closeModal = new EventEmitter<void>();

  editedTaskText: string = '';
  selectedStatus: StatusId = 'todo';
  showOptions = false;
  STATUS_META = STATUS_META;

  constructor(private readonly tasksSvc: TaskService) { }

  ngOnChanges(): void {
    // Sincroniza el formulario cuando cambia la tarea de entrada
    if (this.task) {
      this.editedTaskText = this.task?.text ?? '';
      this.selectedStatus = this.task.status ?? 'todo';
    }
  }
  toggleOptions():void { this.showOptions = !this.showOptions; }
  selectOption(s: StatusId): void { this.selectedStatus = s; this.showOptions = false; }
  close():void { this.showOptions = false; this.closeModal.emit(); }

  guardar() {
    // Upsert de texto y estado, no cierra si texto esta vació
    const text = this.editedTaskText.trim();
    if (!text) return;
    this.tasksSvc.upsert({ id: this.task.id, text, status: this.selectedStatus});
    this.close();
  }

  @HostListener('document:keydown.escape') onEsc() { this.close(); }
}