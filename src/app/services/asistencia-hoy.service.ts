import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AsistenciaHoy {
  id: number;
  numero_reloj: string;
  fecha: string;
  asistencia: boolean;
  puntualidad: string;
  registrado_por: string;
  fecha_registro: string;
}

@Injectable({ providedIn: 'root' })
export class AsistenciaHoyService {
  private apiUrl = 'http://localhost:3001/asistencia-hoy';

  constructor(private http: HttpClient) {}

  getAsistenciaHoy(numero_reloj: string) : Observable<AsistenciaHoy | null> {
    return this.http.get<AsistenciaHoy>(`${this.apiUrl}/${numero_reloj}`);
  }
}
