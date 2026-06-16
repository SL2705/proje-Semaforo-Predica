import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
  import { BackgroundLayoutComponent } from '../../shared/background-layout/background-layout.component';

import {
  IonContent,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-operador',
  templateUrl: './operador.page.html',
  styleUrls: ['./operador.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonContent,
    CommonModule,
    FormsModule,BackgroundLayoutComponent
  ],
})
export class OperadorPage implements OnInit {

  
  view: 'dashboard' | 'password' = 'dashboard';

 
  usuario: any = {};
  historialReciente: any[] = [];
  estadoActual: string = 'SIN REGISTRO';
  semaforo: 'rojo' | 'amarillo' | 'verde' = 'verde';


  passwordActual: string = '';
  passwordNueva: string = '';
  passwordConfirmar: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('usuario');

    if (!data) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = JSON.parse(data);
  }

  ionViewWillEnter() {
    this.cargarHistorial();
  }

  setView(v: 'dashboard' | 'password') {
    this.view = v;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

cargarHistorial() {
  const numero = this.usuario?.numero_reloj;
  if (!numero) return;

  this.http.get<any[]>(`http://localhost:3001/asistencias/${numero}`)
    .subscribe({
      next: (data) => {
        if (!data || !Array.isArray(data)) {
            console.log('DATA inválida:', data);
            return;
          }

        console.log('Asistencias recibidas para semáforo:', data);

        console.log('FALTAS:', data.filter(a => a.puntualidad === 'FALTA').length);
        console.log('PUNTUALIDADES:', data.map(a => a.puntualidad));

        if (!data || data.length === 0) {
          this.estadoActual = 'SIN REGISTRO';
          this.semaforo = 'verde';
          this.historialReciente = [];
          return;
        }

        // historial
        this.historialReciente = data.slice(0, 3);

        // estado actual
        this.estadoActual = data[0].puntualidad;

        // ✔ SOLO UNA FORMA DE CONTAR
        const faltas = data.reduce((total, item) => {
          return total + (item.puntualidad === 'FALTA' ? 1 : 0);
        }, 0);

        // semáforo
        if (faltas >= 3) {
          this.semaforo = 'rojo';
        } else if (faltas >= 1) {
          this.semaforo = 'amarillo';
        } else {
          this.semaforo = 'verde';
        }
      },

      error: (err) => {
        console.error('Error al cargar historial', err);
      }
    });
}

  verKardex() {

    const numero = this.usuario?.numero_reloj;

    if (!numero) {
      alert('Sesión inválida');
      return;
    }

    this.router.navigate(['/kardex', numero]);
  }

  descargarKardex() {

    const numero = this.usuario?.numero_reloj;

    if (!numero) {
      alert('Sesión inválida');
      return;
    }

    this.http.get(
      `http://localhost:3001/kardex/${numero}`,
      { responseType: 'blob' }
    ).subscribe({
      next: (data: Blob) => {

        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `kardex_${numero}.pdf`;
        link.click();

        window.URL.revokeObjectURL(url);

      },
      error: () => {
        alert('Error descargando PDF');
      }
    });

  }
  cambiarPassword() {

    const numero = this.usuario?.numero_reloj;

    if (!numero) {
      alert('Sesión inválida');
      return;
    }

    
    if (!this.passwordActual || !this.passwordNueva || !this.passwordConfirmar) {
      alert('Todos los campos son obligatorios');
      return;
    }

    if (this.passwordNueva.length < 8) {
      alert('La nueva contraseña debe tener mínimo 8 caracteres');
      return;
    }

    if (this.passwordNueva !== this.passwordConfirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.http.put('http://localhost:3001/cambiar-contrasena', {
      numero_reloj: numero,
      password_actual: this.passwordActual,
      password_nueva: this.passwordNueva
    })
    .subscribe({
      next: () => {

        alert('Contraseña actualizada correctamente');

        this.passwordActual = '';
        this.passwordNueva = '';
        this.passwordConfirmar = '';

        this.setView('dashboard');

      },
      error: (err) => {
        console.error(err);
        alert('Error al cambiar contraseña');
      }
    });

  }

}