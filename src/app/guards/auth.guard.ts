import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    
    console.log(' AuthGuard EJECUTÁNDOSE - Ruta:', route.routeConfig?.path);
    
    //  DESACTIVADO PARA PRUEBAS - SIEMPRE PERMITE EL ACCESO
    console.log(' AuthGuard retornando true (desactivado)');
    return true;
    
    /* CÓDIGO ORIGINAL COMENTADO
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    if (!usuario) {
      return this.router.parseUrl('/login');
    }

    const rol = usuario.rol;

    // 🔥 SOPORTE PARA AMBOS (IMPORTANTE)
    const rolesPermitidos = route.data['roles'] as string[] | undefined;
    const rolUnico = route.data['role'] as string | undefined;

    if (rolesPermitidos) {
      if (rolesPermitidos.includes(rol)) {
        return true;
      }
      return this.router.parseUrl('/login');
    }

    if (rolUnico) {
      if (rol === rolUnico) {
        return true;
      }
      return this.router.parseUrl('/login');
    }

    return true;
    */
  }
}