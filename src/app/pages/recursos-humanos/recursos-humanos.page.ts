import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, arrowBackOutline, downloadOutline, chevronForwardOutline, 
  timeOutline, documentTextOutline, checkmarkCircle, alertCircleOutline, 
  removeCircle, documentAttachOutline, keyOutline, alertCircle, 
  ellipsisHorizontalCircle 
} from 'ionicons/icons';

@Component({
  selector: 'app-recursos-humanos',
  templateUrl: './recursos-humanos.page.html',
  styleUrls: ['./recursos-humanos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecursosHumanosPage implements OnInit {
  vista: string = 'lista';
  fechaHoy: string = '';
  filtroSemaforo: string = 'rojo';
  operadorSeleccionado: any = null;

  operadores = [
    { 
      reloj: '26519', 
      nombre: 'Daniel Olivas', 
      linea: 'Línea A', 
      semaforo: 'rojo', 
      estado: 'PENDIENTE RH',
      historial: [
        { fecha: 'HOY', evento: 'SOLICITUD DE SUSPENSIÓN', icono: 'alert-circle-outline', claseIcono: 'black-icon' },
        { fecha: 'AYER', evento: 'FALTA', icono: 'remove-circle', claseIcono: 'red-icon' },
        { fecha: '06 FEB', evento: 'RETARDO', icono: 'time-outline', claseIcono: 'orange-icon' }
      ]
    },
    { 
      reloj: '26520', 
      nombre: 'Carlos Ruiz', 
      linea: 'Línea C', 
      semaforo: 'amarillo', 
      estado: 'PENDIENTE RH',
      historial: [
        { fecha: 'HOY', evento: 'SOLICITUD DE SUSPENSIÓN', icono: 'alert-circle-outline', claseIcono: 'black-icon' },
        { fecha: '06 FEB', evento: 'RETARDO', icono: 'time-outline', claseIcono: 'orange-icon' },
        { fecha: '05 FEB', evento: 'RETARDO', icono: 'time-outline', claseIcono: 'orange-icon' }
      ]
    },
    { 
      reloj: '26700', 
      nombre: 'Mariana Torres', 
      linea: 'Línea B', 
      semaforo: 'verde', 
      estado: 'ACTIVO',
      historial: [
        { fecha: 'HOY', evento: 'PUNTUAL', icono: 'checkmark-circle', claseIcono: 'green-icon' },
        { fecha: 'AYER', evento: 'PUNTUAL', icono: 'checkmark-circle', claseIcono: 'green-icon' },
        { fecha: '06 FEB', evento: 'PUNTUAL', icono: 'checkmark-circle', claseIcono: 'green-icon' }
      ]
    },
    { 
      reloj: '26510', 
      nombre: 'Ana Martínez', 
      linea: 'Línea A', 
      semaforo: 'amarillo', 
      estado: 'ACTIVO',
      historial: [
        { fecha: 'HOY', evento: 'RETARDO', icono: 'time-outline', claseIcono: 'orange-icon' },
        { fecha: 'AYER', evento: 'RETARDO', icono: 'time-outline', claseIcono: 'orange-icon' },
        { fecha: '06 FEB', evento: 'PUNTUAL', icono: 'checkmark-circle', claseIcono: 'green-icon' }
      ]
    },
    { 
      reloj: '26610', 
      nombre: 'Luis García', 
      linea: 'Línea B', 
      semaforo: 'rojo', 
      estado: 'ACTIVO',
      historial: [
        { fecha: 'HOY', evento: 'RETARDO', icono: 'time-outline', claseIcono: 'orange-icon' },
        { fecha: 'AYER', evento: 'FALTA', icono: 'remove-circle', claseIcono: 'red-icon' },
        { fecha: '06 FEB', evento: 'RETARDO', icono: 'time-outline', claseIcono: 'orange-icon' }
      ]
    }
  ];

  constructor() {
    addIcons({ 
      logOutOutline, arrowBackOutline, downloadOutline, chevronForwardOutline, 
      timeOutline, documentTextOutline, checkmarkCircle, alertCircleOutline, 
      removeCircle, documentAttachOutline, keyOutline, alertCircle, 
      ellipsisHorizontalCircle 
    });
  }

  ngOnInit() {
    const opciones: any = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    this.fechaHoy = new Date().toLocaleDateString('es-MX', opciones).toUpperCase();
  }

  setVista(nuevaVista: string) {
    this.vista = nuevaVista;
  }

  get solicitudesPendientes() {
    return this.operadores.filter(op => op.estado === 'PENDIENTE RH');
  }

  get listaSuspendidos() {
    return this.operadores.filter(op => op.estado === 'SUSPENDIDO');
  }

  get listaFiltrada() {
    return this.operadores.filter(op => op.semaforo === this.filtroSemaforo && op.estado === 'ACTIVO');
  }

  verDetalle(op: any) {
    this.operadorSeleccionado = op;
    this.vista = 'detalle';
  }

  gestionarSuspension(accion: string) {
    if (this.operadorSeleccionado) {
      if (accion === 'aprobar') {
        this.operadorSeleccionado.estado = 'SUSPENDIDO';
        this.operadorSeleccionado.historial[0] = { fecha: 'HOY', evento: 'SUSPENSIÓN ACEPTADA', icono: 'remove-circle', claseIcono: 'red-icon' };
      } 
      else if (accion === 'rechazar') {
        this.operadorSeleccionado.estado = 'ACTIVO';
        this.operadorSeleccionado.historial[0] = { fecha: 'HOY', evento: 'SOLICITUD RECHAZADA', icono: 'checkmark-circle', claseIcono: 'green-icon' };
      }
      else if (accion === 'reactivar') {
        this.operadorSeleccionado.estado = 'ACTIVO';
        this.operadorSeleccionado.historial[0] = { 
          fecha: 'HOY', 
          evento: 'PENDIENTE', 
          icono: 'ellipsis-horizontal-circle', 
          claseIcono: 'pending-icon' 
        };
      }
    }
    this.vista = 'lista';
  }

  cerrarSesion() { console.log("Logout"); }
}