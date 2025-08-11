import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private dataKey = 'tasks';
  private dataSubject = new BehaviorSubject<any[]>([]);
  data$ = this.dataSubject.asObservable();
  
  constructor() {
    this.loadData();
   }

   private saveData(data: any[]): void {
    localStorage.setItem(this.dataKey, JSON.stringify(data));
    this.dataSubject.next(data);
   }

   private loadData(): void {
    const dataString = localStorage.getItem(this.dataKey);
    const data = dataString ? JSON.parse(dataString) : [];
    this.dataSubject.next(data);
   }

   addData(newData: any): void {
    const currentData = this.dataSubject.value;
    const updateDate = [...currentData, newData];
    this.saveData(updateDate);
   }

   updateData(updated: any | any[]): void {
    if (Array.isArray(updated)) {
      this.saveData(updated);
      return;
    }

    const currentData = [...this.dataSubject.value];
    const index = currentData.findIndex(task => task.id === updated.id);

    if (index !== -1) {
      currentData[index] = { ...currentData[index], ...updated };
      this.saveData(currentData);
    }
  }

   deleteAllData(): void {
    localStorage.removeItem(this.dataKey);
    this.dataSubject.next([]);
   }

   deleteTask(task: any): void {
    let currentData = this.dataSubject.value;
    const index = currentData.findIndex(t => t.id === task.id);

    if (index !== -1) {
      currentData.splice(index, 1);
      this.saveData(currentData);
    }
   }

}
