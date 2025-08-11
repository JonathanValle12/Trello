import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../layout/table/table.component';
import { BoardComponent } from '../layout/board/board.component';
import { DataService } from '../../service/data.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [HeaderComponent,CommonModule, TableComponent, BoardComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})

export class InicioComponent {

  public selectLayout: 'Board' | 'Table' = 'Board';
  public showModal = false;

  constructor(private _dataService: DataService) { }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  confirmDelete() {
    this.closeModal();
    this._dataService.deleteAllData();

  }
}
