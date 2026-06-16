import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Asistencia {
  id: number;
  numero_reloj: string;
  fecha: string;
  asistencia: boolean;
  puntualidad: string;
  registrado_por: string;
  fecha_registro: string;
}

@Injectable({ providedIn: 'root' })
export class AsistenciasService {
  private apiUrl = 'http://localhost:3001/asistencias';

  constructor(private http: HttpClient) {}

  getHistorial(numero_reloj: string) : Observable<Asistencia[]> {
    return this.http.get<Asistencia[]>(`${this.apiUrl}/${numero_reloj}`);
  }
}
