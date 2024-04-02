import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit{

  public editable: boolean = false;
  public editedTaskText: string = '';
  @Input() visible: any;
  @Input() task: any;

  constructor() {}
  ngOnInit(): void {
    this.editedTaskText = this.task.text;
  }
  editar() {
    this.editable = !this.editable;
    this.editedTaskText = this.task.text;
  }

  close() {
    this.visible = false;
  }
  
  cancelar() {
    this.editable = false;
    this.editedTaskText = this.task.text;
  }

  guardar() {
    console.log("guardar datos");
    const tasks: any[] = JSON.parse(localStorage.getItem('tasks') || '[]');
    const index = tasks.findIndex(t => t.id === this.task.id);

    console.log(index);
    if(index !== -1) {
      this.task.text = this.editedTaskText;
      console.log(this.task);
      tasks[index] = this.task;
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    this.editable = false;
  }
}
