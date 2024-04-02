import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { ModalComponent } from '../../modal/modal.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule, ModalComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {

  public addInputToDo: any = false;
  public addInputInProgress: any = false;
  public addInputDone: any = false;
  public tasksToDo: any[] = [];
  public tasksInProgress: any[] = [];
  public tasksDone: any[] = [];
  public inputValue: string = '';
  public status: string = '';
  public modal: any = false;
  public selectedTask: any;
  public selectedTaskId: string | null = null;

  constructor(private elementRef: ElementRef) { }
  
  ngOnInit(): void {
    this.loadTasksFromLocalStorage();
  }

  openMenu(taskId: any): any {
    this.selectedTaskId = this.selectedTaskId === taskId ? null : taskId;
  }

  addcard(column: string) {
    if (column === 'todo') {
      this.addInputToDo = !this.addInputToDo;
      this.status = 'Todo';
    } else if (column === 'in-progress') {
      this.addInputInProgress = !this.addInputInProgress;
      this.status = 'In Progress';
    } else if (column === 'done') {
      this.addInputDone = !this.addInputDone;
      this.status = 'Done';
    }
  }

  loadTasksFromLocalStorage(): void {
    const storedTasks: any[] = JSON.parse(localStorage.getItem('tasks') || '[]');

    this.tasksToDo = storedTasks.filter(task => task.status === 'Todo');
    this.tasksInProgress = storedTasks.filter(task => task.status === 'In Progress');
    this.tasksDone = storedTasks.filter(task => task.status === 'Done');
  }

  @HostListener('window:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    if ((this.addInputToDo || this.addInputInProgress || this.addInputDone) && this.inputValue.trim() !== '' && event.key === 'Enter') {
      this.addInputToDo = false;
      this.addInputInProgress = false;
      this.addInputDone = false;

      const taskId = uuidv4();

      const newTask = {
        id: taskId,
        text: this.inputValue.trim(),
        createdDate: new Date().toLocaleDateString('es-ES', { month: 'long', day: '2-digit' }),
        status: this.status
      }

      let tasks: any[] = JSON.parse(localStorage.getItem('tasks') || '[]');

      tasks.push(newTask);

      localStorage.setItem('tasks', JSON.stringify(tasks));

      this.loadTasksFromLocalStorage();
      this.inputValue = '';
    }
  }

  @HostListener('window:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Verificar si los elementos existen antes de acceder a la propiedad 'contains'
    const inputClassElement = this.elementRef.nativeElement.querySelector('.input-class');
    const footerTodoElement = this.elementRef.nativeElement.querySelector('.footer-todo');
    const footerInProgressElement = this.elementRef.nativeElement.querySelector('.footer-in-progress');
    const footerDoneElement = this.elementRef.nativeElement.querySelector('.footer-done');
    if (inputClassElement &&
      footerTodoElement && footerInProgressElement && footerDoneElement &&
      !inputClassElement.contains(target) &&
      !footerTodoElement.contains(target) &&
      !footerInProgressElement.contains(target) &&
      !footerDoneElement.contains(target)) {
      this.addInputToDo = false; // Ocultar el input
      this.addInputInProgress = false;
      this.addInputDone = false;
    }
  }

  onTaskDrop(event: CdkDragDrop<any[]>, listName: string) {
    const task = event.item.data;

    // Determinar la lista de destino según el id del contenedor
    let destinationList: any[] = [];
    if (listName === 'tasksToDo') {
      destinationList = this.tasksToDo;
      task.status = 'Todo';
    } else if (listName === 'tasksInProgress') {
      destinationList = this.tasksInProgress;
      task.status = 'In progress';
    } else if (listName === 'tasksDone') {
      destinationList = this.tasksDone;
      task.status = 'Done';
    }

    // Mover el elemento en la lista de destino
    if (destinationList) {
      transferArrayItem(
        event.previousContainer.data,
        destinationList,
        event.previousIndex,
        event.currentIndex
      );

      // Actualizar solo la lista de destino en el almacenamiento local
      if (listName === 'Todo') {
        localStorage.setItem('tasksToDo', JSON.stringify(this.tasksToDo));
      } else if (listName === 'in-progress') {
        localStorage.setItem('tasksInProgress', JSON.stringify(this.tasksInProgress));
      } else if (listName === 'done') {
        localStorage.setItem('tasksDone', JSON.stringify(this.tasksDone));
      }
    }
  }

  openModal(task: any) {
    this.modal = !this.modal;
    this.selectedTask = task;
  }
  deleteTask(task: any) {
    console.log(task);

    let tasks: any[] = JSON.parse(localStorage.getItem('tasks') || '[]');

    const index = tasks.findIndex(t => t.id === task.id);

    if (index !== -1) {
      tasks.splice(index, 1);

      localStorage.setItem('tasks', JSON.stringify(tasks));

      this.loadTasksFromLocalStorage();
    }
  }
}
