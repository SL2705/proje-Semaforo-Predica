import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
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
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class OperadorPage implements OnInit {

  view: 'dashboard' | 'password' = 'dashboard';
  isKardexOpen: boolean = false;

  usuario: any = {};
  kardexData: any = null;

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

  // 🔹 MÉTODO QUE FALTABA
  setView(v: 'dashboard' | 'password') {
    this.view = v;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
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
      `http://192.168.1.13:3000/kardex/${numero}`,
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
}