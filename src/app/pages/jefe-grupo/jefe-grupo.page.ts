import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
  import { BackgroundLayoutComponent } from '../../shared/background-layout/background-layout.component';
import { addIcons } from 'ionicons';
import {
  calendarClearOutline, personOutline, checkmarkCircle,
  chevronForwardOutline, arrowBackOutline, logOutOutline,
  keyOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-jefe-grupo',
  templateUrl: './jefe-grupo.page.html',
  styleUrls: ['./jefe-grupo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BackgroundLayoutComponent]
})
export class JefeGrupoPage implements OnInit {

  vista: string = 'lista';
  usuario: any = {};

  // Ahora incluye TODAS
  LINEAS: string[] = ["Todas", "Linea A", "Linea B"];
  lineaSeleccionada: string = "Todas";

  fechaHoy: string = "";
  operadorActual: any = null;
  asistenciaSeleccionada: boolean = true;

  operadores: any[] = [];

  private API_URL = "http://localhost:3001";

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({
      calendarClearOutline,
      personOutline,
      checkmarkCircle,
      chevronForwardOutline,
      arrowBackOutline,
      logOutOutline,
      keyOutline
    });
  }

  ngOnInit() {

    const data = localStorage.getItem('usuario');

    if (!data) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = JSON.parse(data);

    const opciones: any = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    this.fechaHoy = new Date()
      .toLocaleDateString('es-MX', opciones)
      .toUpperCase();
  }

  ionViewWillEnter() {
    this.cargarOperadores();
  }

  seleccionarLinea(linea: string) {
    this.lineaSeleccionada = linea;
  }

  // 🔥 Ahora trae ambas líneas desde backend
  cargarOperadores() {
    this.http.get<any[]>(`${this.API_URL}/operadores-jefe`)
      .subscribe(data => {

        this.operadores = data.map(op => ({
          id: op.numero_reloj,
          nombre: op.nombre_completo,
          linea: op.linea_trabajo,
          listo: false,
          estado: 'activo'
        }));

        console.log("Operadores cargados:", this.operadores);
      });
  }

  setVista(nuevaVista: string) {
    this.vista = nuevaVista;
  }

  get filtrados() {

    if (this.lineaSeleccionada === 'Todas') {
      return this.operadores;
    }

    return this.operadores.filter(
      op => op.linea === this.lineaSeleccionada
    );
  }

  get aptosParaRegistro() {
    return this.filtrados.filter(op => op.estado === 'activo');
  }

  get conteoListos() {
    return this.aptosParaRegistro.filter(op => op.listo).length;
  }

  abrirRegistro(op: any) {
    if (op.listo || op.estado !== 'activo') return;
    this.operadorActual = op;
    this.asistenciaSeleccionada = true;
    this.vista = 'registro';
  }

guardar(event: any) {
  event.preventDefault();

  if (!this.operadorActual) return;

  console.log("USUARIO ACTUAL:", this.usuario);

  const data = {
    numero_reloj: this.operadorActual.id,
    tipo: this.asistenciaSeleccionada ? 'PUNTUAL' : 'FALTA',
    registrado_por: this.usuario.nombre
  };

  console.log("DATA ENVIADA:", data);

  // Usar ruta que actualiza si ya existe
  this.http.put(`${this.API_URL}/corregir-asistencia`, data)
    .subscribe({
      next: (resp) => {
        console.log("RESPUESTA:", resp);
        this.operadorActual.listo = true;
        this.vista = 'lista';
      },
      error: (err) => {
        console.error(err);
      }
    });
}

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}