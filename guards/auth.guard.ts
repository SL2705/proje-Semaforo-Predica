import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rolNecesario = route.data['role'];

    if (!usuario || usuario.rol !== rolNecesario) {
      // Redirige a login si no hay usuario o rol incorrecto
      this.router.navigate(['/login']);
      return false;
    }

    return true; // Usuario y rol correctos
  }
}
