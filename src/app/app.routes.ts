import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './component/inicio/inicio.component';
import { ModuleWithProviders } from '@angular/core';

export const routes: Routes = [
    {path: "", component: InicioComponent}
];

export const routing: ModuleWithProviders<any> = RouterModule.forRoot(routes);