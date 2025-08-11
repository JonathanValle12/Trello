import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../service/data.service';

export type Status = 'Todo' | 'In Progress' | 'Done';
export interface Task { id: string; text: string; status: Status | string; }

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
  @Output() save = new EventEmitter<Task>(); 

  editedTaskText: string = '';
  selectedStatus: Status = 'Todo';
  showOptions = false;

  ngOnChanges() {
    if (this.task) {
      this.editedTaskText = this.task.text ?? '';
      this.selectedStatus = this.task.status as Status;
    }
  }

  toggleOptions() { this.showOptions = !this.showOptions;}
  selectOption(s: Status) { this.selectedStatus = s; this.showOptions = false;}

  constructor(private _dataService: DataService) {}

  close() { this.showOptions = false; this.closeModal.emit()};

  guardar() {
    console.log("guardar datos");
    const text = this.editedTaskText.trim();
    if (!text) return;
    this._dataService.updateData({ id: this.task.id, text, status: this.selectedStatus});
    this.close();
  }

  @HostListener('document:keydown.escape') onEsc() { this.close()};
}