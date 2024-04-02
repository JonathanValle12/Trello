import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../layout/table/table.component';
import { BoardComponent } from '../layout/board/board.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [HeaderComponent,CommonModule, TableComponent, BoardComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})

export class InicioComponent {

  public selectLayout: string = 'Board';
  constructor() { }

  cambioLayout(layout: string) {
    this.selectLayout = layout;
  }

}
