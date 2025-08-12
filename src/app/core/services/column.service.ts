import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Column, CORE_COLUMNS } from "../models/column.model";
import { StorageService } from "./storage.service";

@Injectable({ providedIn: 'root' })
export class ColumnService {
    private readonly KEY = 'columns';
    private readonly _columns$ = new BehaviorSubject<Column[]>(this.storage.get<Column[]>(this.KEY, CORE_COLUMNS));
    readonly columns$ = this._columns$.asObservable();

    constructor(private readonly storage: StorageService) {
        this.ensureCore(); // garantiza que las columnas core existan y sigan marcadas como core
     }

     // Get/Set centralizados para persistir y emitir cambios
    private get state(): Column[] { return this._columns$.value; };
    private set state(next: Column[]) {
        this.storage.set(this.KEY, next);
        this._columns$.next(next);
    }

    add(col: Omit<Column, 'id'> & { id?: string }): void {
        // Genera id unico a partir del título
        const id = col.id ?? this.slugify(col.title);
        if (this.state.some(c => c.id === id)) return; // evita duplicados
        this.state = [...this.state, { ...col, id }];
    }

    update(id: string, partial: Partial<Column>): void {
        this.state = this.state.map(c => c.id === id ? { ...c, ...partial } : c);
    }

    delete(id: string): void {
        const target = this.state.find(c => c.id === id);
        if (target?.isCore) return; // no borrar core
        this.state = this.state.filter(c => c.id !== id);
    }

    reorder(prevIndex: number, currIndex: number): void {
        if (prevIndex === currIndex) return;
        const arr = this.state.slice();
        const [moved] = arr.splice(prevIndex, 1);
        arr.splice(currIndex, 0, moved);
        this.state = arr; // Reemplazo inmutable para disparar cambio y persistir
    }

    resetToDefaults(): void { this.state = CORE_COLUMNS.slice(); }

    titleOf(id: string): string | undefined {
        return this.state.find(c => c.id === id)?.title;
    }

    private ensureCore(): void {
        // Mantiene siempre presenten las columna core y su flag isCore
        const map = new Map(this.state.map(c => [c.id, c]));
        let changed = false;

        for (const core of CORE_COLUMNS) {
            const existing = map.get(core.id);
            if (!existing) {
                map.set(core.id, { ...core });
                changed = true;
            } else if (!existing.isCore) {
                existing.isCore = true;
                changed = true;
            }
        }

        if (changed) this.state = Array.from(map.values());
    }

    private slugify(s: string): string {
        // Genera un slug y resuelve colisiones añadiendo sufijo incremental
        const base = s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        if (!base) return `col-${Date.now()}`;
        let slug = base; let i = 1;
        while (this.state.some(c => c.id === slug)) slug = `${base}-${i++}`;
        return slug;
    }
}