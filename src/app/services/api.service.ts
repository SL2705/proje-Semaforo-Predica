import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Solicitud {
  id: string;
  usuario_id: string;
  nombre: string;
  reloj: string;
  linea: string;
  motivo?: string;
  estado: 'PENDIENTE RH' | 'SUSPENDIDO' | 'RECHAZADA';
  fecha_solicitud: string;
}

export interface Operador {
  id: string;
  reloj: string;
  nombre: string;
  linea: string;
  estado: 'ACTIVO' | 'SUSPENDIDO';
  semaforo: 'rojo' | 'amarillo' | 'verde';
  historial?: HistorialEvento[];
}

export interface HistorialEvento {
  fecha: string;
  evento: string;
  icono: string;
  claseIcono: string;
}

export interface Reporte {
  ok: boolean;
  filtro: string;
  total: number;
  fecha_generacion: string;
  datos: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private BASE_URL = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las solicitudes de suspensión pendientes
   */
  getSolicitudesPendientes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(
      `${this.BASE_URL}/rrhh/solicitudes-pendientes`
    );
  }

  /**
   * Obtiene los operadores con estado SUSPENDIDO
   */
  getSuspendidos(): Observable<Operador[]> {
    return this.http.get<Operador[]>(
      `${this.BASE_URL}/rrhh/suspendidos`
    );
  }

  /**
   * Obtiene los operadores activos con su estado en el semáforo
   */
  getOperadoresSemaforo(): Observable<Operador[]> {
    return this.http.get<Operador[]>(
      `${this.BASE_URL}/rrhh/operadores-semaforo`
    );
  }

  /**
   * Aprueba una solicitud de suspensión
   */
  aprobarSuspension(solicitudId: string, usuarioId: string): Observable<any> {
    return this.http.put(
      `${this.BASE_URL}/rrhh/solicitud/${solicitudId}/aprobar`,
      { usuarioId }
    );
  }

  /**
   * Rechaza una solicitud de suspensión
   */
  rechazarSuspension(solicitudId: string, usuarioId: string): Observable<any> {
    return this.http.put(
      `${this.BASE_URL}/rrhh/solicitud/${solicitudId}/rechazar`,
      { usuarioId }
    );
  }

  /**
   * Reestablece un operador (quita la suspensión)
   */
  reestablecerOperador(operadorId: string): Observable<any> {
    return this.http.put(
      `${this.BASE_URL}/rrhh/operador/${operadorId}/reestablecer`,
      {}
    );
  }

  /**
   * Genera un reporte por color de semáforo
   */
  generarReporte(filtro: 'rojo' | 'amarillo' | 'verde'): Observable<Reporte> {
    return this.http.get<Reporte>(
      `${this.BASE_URL}/rrhh/reporte/generar?filtro=${filtro}`
    );
  }
}
