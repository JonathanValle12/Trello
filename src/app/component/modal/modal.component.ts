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

  public showOptions: boolean = false;
  public editable: boolean = false;
  public editedTaskText: string = '';
  public selectedOption: string = 'Todo';
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
    this.updateAndSaveTask();
    this.editable = false;
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  selectOption(option: string) {
    this.showOptions = false;
    this.selectedOption = option;
    this.updateAndSaveTask();
  }

  private updateAndSaveTask() {
    const tasks: any[] = JSON.parse(localStorage.getItem('tasks') || '[]');
    const index = tasks.findIndex(t => t.id === this.task.id);

    if(index !== -1) {
      this.task.text = this.editedTaskText;
      this.task.status = this.selectedOption;
      console.log(this.task);
      tasks[index] = this.task;
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }

}
