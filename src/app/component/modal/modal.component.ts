import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../service/data.service';

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
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _dataService: DataService) {}
  ngOnInit(): void {
    this.editedTaskText = this.task.text;
    console.log(this.visible);
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
    
    const newData = {
      ...this.task,
      text: this.editedTaskText,
      status: this.selectedOption
    }

    this.task.status = this.selectedOption;

    this._dataService.updateData(newData);
  }

}