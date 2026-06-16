import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nombre_completo: string;
  numero_reloj: string;
  rol: string;
  linea_trabajo: string;
  lineas_a_cargo: string;
  departamento: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private apiUrl = 'http://localhost:3001/usuarios'; // Cambia el puerto si tu backend usa otro
  private semaforoUrl = 'http://localhost:3001/rrhh/operadores-semaforo';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getOperadoresSemaforo(): Observable<any[]> {
    return this.http.get<any[]>(this.semaforoUrl);
  }
}
