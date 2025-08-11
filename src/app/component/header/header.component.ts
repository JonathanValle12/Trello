import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type Layout = 'Board' | 'Table';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  @Input() selectLayout: Layout = 'Board';
  @Output() selectLayoutChange = new EventEmitter<Layout>();
  @Output() deleteAll = new EventEmitter<void>();

  cambioLayout(layout: Layout) {
    if (this.selectLayout !== layout) {
      this.selectLayoutChange.emit(layout);
    }
  }
}
