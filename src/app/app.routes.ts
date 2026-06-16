import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },

  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.page').then(m => m.RegistroPage)
  },

  {
    path: 'kardex/:reloj',
    // canActivate: [AuthGuard],
    // data: { roles: ['operador', 'supervisor'] },
    loadComponent: () =>
      import('./kardex/kardex.page').then(m => m.KardexPage)
  },

  {
    path: 'operador',
    // canActivate: [AuthGuard],
    // data: { roles: ['operador'] },
    loadComponent: () =>
      import('./pages/operador/operador.page').then(m => m.OperadorPage)
  },

  {
    path: 'supervisor',
    // canActivate: [AuthGuard],
    // data: { roles: ['supervisor'] },
    loadComponent: () =>
      import('./pages/supervisor/supervisor.page').then(m => m.SupervisorPage)
  },

  {
    path: 'rrhh',
    // canActivate: [AuthGuard],
    // data: { roles: ['rrhh'] },
    loadComponent: () =>
      import('./pages/recursos-humanos/recursos-humanos.page')
        .then(m => m.RecursosHumanosPage)
  },

  {
    path: 'jefe',
    // canActivate: [AuthGuard],
    // data: { roles: ['jefe'] },
    loadComponent: () =>
      import('./pages/jefe-grupo/jefe-grupo.page')
        .then(m => m.JefeGrupoPage)
  },

  {
    path: 'sistemas',
    // canActivate: [AuthGuard],
    // data: { roles: ['sistemas'] },
    loadComponent: () =>
      import('./pages/sistemas/sistemas.page')
        .then(m => m.SistemasPage)
  }
];