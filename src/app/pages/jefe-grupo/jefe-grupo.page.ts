import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  calendarClearOutline, personOutline, checkmarkCircle,
  chevronForwardOutline, arrowBackOutline, logOutOutline,
  keyOutline, menuOutline, megaphoneOutline, documentTextOutline,
  shieldCheckmarkOutline, helpCircleOutline, timeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-jefe-grupo',
  templateUrl: './jefe-grupo.page.html',
  styleUrls: ['./jefe-grupo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class JefeGrupoPage implements OnInit {
  vista: string = 'lista';
  JEFE_NOMBRE: string = "Ricardo Méndez";
  LINEAS: string[] = ["Línea A", "Línea B"];
  lineaSeleccionada: string = "Línea A";
  fechaHoy: string = "";
  operadorActual: any = null;
  asistenciaSeleccionada: boolean = true;

  operadores = [
    { id: '101', nombre: 'DANIEL OLIVAS', linea: 'Línea A', listo: false, estado: 'activo' },
    { id: '102', nombre: 'MIGUEL RIVERA', linea: 'Línea A', listo: true, estado: 'activo' },
    { id: '103', nombre: 'LORENZO HEREDIA', linea: 'Línea A', listo: false, estado: 'VACACIONES' },
    { id: '201', nombre: 'LEONARDO VICTORINO', linea: 'Línea B', listo: false, estado: 'activo' },
    { id: '202', nombre: 'JORGE ENRIQUEZ', linea: 'Línea B', listo: false, estado: 'PERMISO' },
    { id: '203', nombre: 'CALEB SANCHEZ', linea: 'Línea B', listo: false, estado: 'INCAPACIDAD' },
  ];

  constructor() {
    addIcons({
      calendarClearOutline, personOutline, checkmarkCircle,
      chevronForwardOutline, arrowBackOutline, logOutOutline,
      keyOutline, menuOutline, megaphoneOutline, documentTextOutline,
      shieldCheckmarkOutline, helpCircleOutline, timeOutline
    });
  }

  ngOnInit() {
    const opciones: any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const hoy = new Date().toLocaleDateString('es-MX', opciones);
    this.fechaHoy = hoy.toUpperCase();
  }

  //Logica para el cambio de vista//
  setVista(nuevaVista: string) {
    this.vista = nuevaVista;
  }

  get filtrados() {
    return this.operadores.filter(op => op.linea === this.lineaSeleccionada);
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
    if (this.operadorActual) {
      this.operadorActual.listo = true;
      this.vista = 'lista';
    }
  }

  cerrarSesion() {
    console.log("Cerrando sesión...");
  }
}
