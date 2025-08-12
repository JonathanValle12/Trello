import { ChangeDetectionStrategy,Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../features/table/table.component';
import { BoardComponent } from '../../features/board/board.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Layout } from '../../shared/types/types';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [HeaderComponent,CommonModule, TableComponent, BoardComponent, ConfirmDialogComponent],
  templateUrl: 'inicio.component.html',
  styleUrl: './inicio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush // UI depende de streams/inputs -> OnPush evita renders innecesarios
})

export class InicioComponent {

  layout: Layout = 'Board';
  confirmOpen = false;

  constructor(private readonly tasks: TaskService) { }

  onLayoutChange(next: Layout): void { this.layout = next; }
  onDeleteAllRequest(): void { this.confirmOpen = true; }
  onConfirmDelete(): void { this.tasks.deleteAll(); this.confirmOpen = false; }
  onCancelDelete(): void { this.confirmOpen = false;}
}
