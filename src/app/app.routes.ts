import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'operador',
    loadComponent: () => import('./pages/operador/operador.page').then( m => m.OperadorPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'jefe-grupo',
    loadComponent: () => import('./pages/jefe-grupo/jefe-grupo.page').then( m => m.JefeGrupoPage)
  },
  {
    path: 'supervisor',
    loadComponent: () => import('./pages/supervisor/supervisor.page').then( m => m.SupervisorPage)
  },
  {
    path: 'recursos-humanos',
    loadComponent: () => import('./pages/recursos-humanos/recursos-humanos.page').then( m => m.RecursosHumanosPage)
  }
];
