import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SuspendidosService {

  private apiUrl = 'http://localhost:3001/usuarios-suspendidos';

  constructor(private http: HttpClient) {}

  /* Obtener suspendidos */
  getSuspendidos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /* ✅ MOVER DENTRO DE LA CLASE */
  aceptarSuspension(numero_reloj: string): Observable<any> {
    return this.http.post('http://localhost:3001/suspensiones/aceptar', {
      numero_reloj
    });
  }

  /* ✅ MOVER DENTRO DE LA CLASE */
  rechazarSuspension(numero_reloj: string): Observable<any> {
    return this.http.post('http://localhost:3001/suspensiones/rechazar', {
      numero_reloj
    });
  }
}