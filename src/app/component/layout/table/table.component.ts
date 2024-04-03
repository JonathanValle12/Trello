import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../service/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {

  public tasks: any[] = [];
  public editingTaskId: any = null;
  public inputValue: string = '';
  public opcionSeleccionada: string = '';

  constructor(private _dataService: DataService) {}

  ngOnInit(): void {
    this._dataService.data$.subscribe(data => {
      this.tasks = data;
    })

  }

  enableInput(task: any): void {
    if (this.editingTaskId === task.id) {
      this.editingTaskId = null;
    } else {
      this.editingTaskId = task.id;
      this.inputValue = task.text;
    }
  }

  cancelar(task: any): void {
    console.log(task);
    this.editingTaskId = null;

  }

  selectOption() {
    console.log(this.opcionSeleccionada);
  }

  editar(task: any): void {

      const newData = {
        ...task,
        text: this.inputValue,
      }
      this._dataService.updateData(newData);

      this.editingTaskId = null;
  }
}
