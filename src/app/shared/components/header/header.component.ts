import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout } from '../../types/types';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  @Input({ required: true }) layout!: Layout;
  @Output() layoutChange = new EventEmitter<Layout>();
  @Output() deleteAll = new EventEmitter<void>();

  setLayout(next: Layout): void {
    // Evita emitir si no hay cambio
    if (this.layout !== next) this.layoutChange.emit(next);
  }
}