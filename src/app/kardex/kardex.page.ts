import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

import {
  IonContent,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.page.html',
  styleUrls: ['./kardex.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    CommonModule
  ]
})
export class KardexPage implements OnInit {
  today = new Date();

  kardexData: any = null;
  numero: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.numero = params.get('reloj') || '';
      console.log('Número recibido:', this.numero);

      if (!this.numero) {
        console.warn('No llegó número de reloj, redirigiendo...');
        this.router.navigate(['/operador']);
      }
    });
  }

  ionViewWillEnter() {
    if (this.numero) {
      this.cargarKardex();
    }
  }

  /* =============================
     CARGAR KARDEX
  ============================= */
  cargarKardex() {
    if (!this.numero) {
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/kardex/${this.numero}`).subscribe({
      next: (data) => {
        console.log('KARDEX DATA:', data);
        this.kardexData = data;
      },
      error: (err) => {
        console.error('Error cargando kardex', err);
      }
    });
  }

  /* =============================
     VOLVER
  ============================= */
  volver() {
    this.router.navigate(['/operador']);
  }

  /* =============================
     DESCARGAR PDF
  ============================= */
  descargarKardex() {
    if (!this.numero) {
      return;
    }

    this.http.get(`${environment.apiUrl}/kardex-pdf/${this.numero}`, { responseType: 'blob' }).subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `kardex_${this.numero}.pdf`;
        link.click();

        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Error descargando PDF');
      }
    });
  }
}
