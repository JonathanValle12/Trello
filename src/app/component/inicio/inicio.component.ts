import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [HeaderComponent, ModalComponent, CommonModule, FormsModule, DragDropModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})

export class InicioComponent implements OnInit {

  public addInput: any = false;
  public inputValue: string = '';
  public tasksToDo: any[] = [];
  public tasksInProgress: any[] = [];
  public tasksDone: any[] = [];
  public modal: any = false;
  public selectedTask: any;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.loadTasksFromLocalStorage();
  }
  addcard() {
    this.addInput = !this.addInput;
  }

  loadTasksFromLocalStorage(): void {
    const storedTasks: any[] = JSON.parse(localStorage.getItem('tasks') || '[]');

    this.tasksToDo = storedTasks.filter(task => task.status === 'to do');
    this.tasksInProgress = storedTasks.filter(task => task.status === 'In progress');
    this.tasksDone = storedTasks.filter(task => task.status === 'Done');
  }

  @HostListener('window:click', ['$event'])
onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  // Verificar si los elementos existen antes de acceder a la propiedad 'contains'
  const inputClassElement = this.elementRef.nativeElement.querySelector('.input-class');
  const footerElement = this.elementRef.nativeElement.querySelector('footer');

  if (inputClassElement && footerElement &&
      !inputClassElement.contains(target) && !footerElement.contains(target)) {
    this.addInput = false; // Ocultar el input
  }
}


  @HostListener('window:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    if (this.addInput && this.inputValue.trim() !== '' && event.key === 'Enter') {
      this.addInput = false;

      const taskId = uuidv4();

      const newTask = {
        id: taskId,
        text: this.inputValue.trim(),
        createdDate: new Date().toLocaleDateString('es-ES', { month: 'long', day:'2-digit'}),
        status: 'to do'
      }

      let tasks: any[] = JSON.parse(localStorage.getItem('tasks') || '[]');
  
      tasks.push(newTask);

      localStorage.setItem('tasks', JSON.stringify(tasks));

      this.loadTasksFromLocalStorage();
      this.inputValue = '';
    }
  }

  onTaskDrop(event: CdkDragDrop<any[]>, listName: string) {
    const task = event.item.data;
  
    // Determinar la lista de destino según el id del contenedor
    let destinationList: any[] = [];
    if (listName === 'tasksToDo') {
      destinationList = this.tasksToDo;
      task.status = 'to do';
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
      if (listName === 'to-do') {
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
}
