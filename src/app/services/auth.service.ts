import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface Usuario {
  id: string;
  nombre: string;
  numero_reloj: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private BASE_URL = 'http://localhost:3001';
  private usuarioActual: Usuario | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.cargarUsuarioDelStorage();
  }

  /**
   * Carga el usuario desde localStorage (donde lo guarda el login)
   */
  private cargarUsuarioDelStorage(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        this.usuarioActual = JSON.parse(usuarioGuardado);
      } catch (error) {
        console.error('Error al cargar usuario del storage:', error);
      }
    }
  }

  /**
   * Obtiene el usuario actualmente autenticado
   */
  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual;
  }

  /**
   * Obtiene el nombre del usuario actual
   */
  obtenerNombreUsuario(): string {
    return this.usuarioActual?.nombre || 'Usuario';
  }

  /**
   * Obtiene el ID del usuario actual
   */
  obtenerUsuarioId(): string | null {
    return this.usuarioActual?.id || null;
  }

  /**
   * Cambiar contraseña del usuario
   */
  async cambiarContrasena(
    contrasenaActual: string,
    contrasenaNueva: string
  ): Promise<any> {
    try {
      if (!this.usuarioActual?.id) {
        throw new Error('Usuario no autenticado');
      }

      const response = await this.http.put(
        `${this.BASE_URL}/cambiar-contrasena`,
        {
          usuarioId: this.usuarioActual.id,
          passwordActual: contrasenaActual,
          passwordNueva: contrasenaNueva
        }
      ).toPromise();

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.usuarioActual = null;
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  estaAutenticado(): boolean {
    return this.usuarioActual !== null;
  }
}
