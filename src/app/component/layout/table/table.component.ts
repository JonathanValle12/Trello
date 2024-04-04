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
  public filtrarClave: string = '';
  public originalValue: string = '';
  public editionIndex: number | null = null;

  constructor(private _dataService: DataService) {}

  ngOnInit(): void {
    this._dataService.data$.subscribe(data => {
      this.tasks = data;
    })

  }

  enableInput(task: any, index: number): void {
   
    if (this.editingTaskId === task.id) {
      this.editingTaskId = null;
      this.inputValue = '';
    } else {
      this.editingTaskId = task.id;
      this.inputValue = task.text;
    }
    
    this.editionIndex = index;
  }

  cancelar(task: any): void {
    console.log(task);
    this.editingTaskId = null;
    this.inputValue = this.originalValue;
    this.editionIndex = null;

  }

  actualizarStatus(task: any): void {
    const newData = {
      ...task,
      status: this.opcionSeleccionada
    }
    this._dataService.updateData(newData);
  }

  editar(task: any): void {
    task.originalValue = task.text;

      const newData = {
        ...task,
        text: this.inputValue,
        status: task.status
      }
      this._dataService.updateData(newData);

      this.editingTaskId = null;
      this.originalValue = '';
      this.editionIndex = null;
  }

  filtrarDatos(): any[] {
    if (this.filtrarClave.trim() === '') {
      return this.tasks;
    }else {
      return this.tasks.filter(task => task.text.toLowerCase().includes(this.filtrarClave.trim().toLowerCase()));
    }
  }
}
