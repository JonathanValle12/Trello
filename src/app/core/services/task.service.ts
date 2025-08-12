import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { StorageService } from "./storage.service";
import { Task, StatusId } from "../models/task.model";

@Injectable({ providedIn: 'root' })
export class TaskService {
    private readonly KEY = 'tasks';
    // Carga inicial desde storage; BehaviorSubject para push reactivo a la UI
    private readonly _tasks$ = new BehaviorSubject<Task[]>(this.storage.get<Task[]>(this.KEY, []));
    readonly tasks$ = this._tasks$.asObservable();

    constructor(private readonly storage: StorageService) { }

    private get state(): Task[] { return this._tasks$.value; }
    private set state(next: Task[]) {
        this.storage.set(this.KEY, next);
        this._tasks$.next(next);
    }

    add(task: Omit<Task, 'createdAt' | 'updatedAt'>): void {
        const now = Date.now();
        this.state = [...this.state, { ...task, createdAt: now, updatedAt: now }];
    }

    upsert(partial: Partial<Task> & { id: string }): void {
        // Upsert por id: crea si no existe, si existe mergea + actualiza updatedAt
        const list = this.state.slice();
        const idx = list.findIndex(t => t.id === partial.id);

        if (idx === -1) {
            const now = Date.now();
            const base: Task = {
                id: partial.id,
                text: partial.text ?? '',
                status: (partial.status ?? 'todo') as StatusId,
                createdAt: now,
                updatedAt: now,
            };
            this.state = [...list, base];
            return;
        }

        const old = list[idx];
        list[idx] = { ...old, ...partial, updatedAt: Date.now() };
        this.state = list;
    }

    delete(id: string): void {
        this.state = this.state.filter(t => t.id !== id);
    }

    deleteAll(): void {
        // Limpia storage y emite lista vacia (sin persistir array vacio)
        this.storage.remove(this.KEY);
        this._tasks$.next([]);
    }

    updateText(id: string, text: string) { this.upsert({ id, text }) };
    updateStatus(id: string, status: StatusId) { this.upsert({ id, status }) };
}