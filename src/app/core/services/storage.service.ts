import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class StorageService {
    get<T>(key: string, fallback: T): T {
        // Maneja JSON inválido/sin clave y devuelve fallback de forma segura
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) as T : fallback;
        } catch {
            return fallback;
        }
    }

    set<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    remove(key: string): void {
        localStorage.removeItem(key);
    }
}