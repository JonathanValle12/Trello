import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { ModalComponent } from '../../modal/modal.component';
import { DataService } from '../../../service/data.service';

enum Status {
  TODO = 'Todo',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule, ModalComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {

  public tasksToDo: any[] = [];
  public tasksInProgress: any[] = [];
  public taskDone: any[] = [];

  public selectedTaskId: string | null = null;

  public modal = false;
  public selectedTask: any;

  public addingColumn: 'todo' | 'in-progress' | 'done' | null = null;
  public newTitle = '';

  constructor(
    private elementRef: ElementRef,
    private _dataService: DataService
  ) { }

  ngOnInit(): void {
    this._dataService.data$.subscribe(data => {
      this.tasksToDo = data.filter(t => t.status === Status.TODO);
      this.tasksInProgress = data.filter(t => t.status === Status.IN_PROGRESS);
      this.taskDone = data.filter(t => t.status === Status.DONE);
    })
  }

  openMenu(taskId: string, e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.selectedTaskId = this.selectedTaskId === taskId ? null : taskId;
  }
  closeMenu() { this.selectedTaskId = null; }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    const menu = this.elementRef.nativeElement.querySelector('.ctx-menu');
    const btn = this.elementRef.nativeElement.querySelector('.ctx-btn');
    if (menu && !menu.contains(target) && btn && !btn.contains(target)) {
      this.closeMenu();
    }
  }

  startAdd(col: 'todo' | 'in-progress' | 'done') {
    this.addingColumn = col;
    this.newTitle = '';
  }

  cancelAdd() {
    this.addingColumn = null;
    this.newTitle = '';
  }

  addTask(col: 'todo' | 'in-progress' | 'done') {
    const text = this.newTitle.trim();
    if (!text) return;

    const statusMap = {
      'todo': Status.TODO,
      'in-progress': Status.IN_PROGRESS,
      'done': Status.DONE
    } as const;

    const newTask = {
      id: uuidv4(),
      text,
      createdDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long' }),
      status: statusMap[col]
    };

    this._dataService.addData(newTask);
    this.cancelAdd();
  }

  onTaskDrop(event: CdkDragDrop<any[]>) {
    const task = event.item.data;

    if (event.previousContainer !== event.container) {
      const containerToStatus = new Map<any, Status>([
        [this.tasksToDo, Status.TODO],
        [this.tasksInProgress, Status.IN_PROGRESS],
        [this.taskDone, Status.DONE],
      ]);

      const newStatus = containerToStatus.get(event.container.data);
      if (newStatus) task.status = newStatus;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // Persistir
    this._dataService.updateData([
      ...this.tasksToDo,
      ...this.tasksInProgress,
      ...this.taskDone
    ]);
  }

  openModal(task: any) {
    this.modal = !this.modal;
    this.selectedTask = task;
    this.closeMenu();
  }

  deleteTask(task: any) {
    this.modal = false;
    this._dataService.deleteTask(task);
    this.closeMenu();
  }

  trackById(_: number, t: any) { return t.id; }
}