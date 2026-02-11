import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  logOutOutline, chevronForwardOutline, arrowBackOutline,
  checkmarkCircle, timeOutline, documentTextOutline,
  airplaneOutline, calendarOutline, banOutline,
  documentAttachOutline, alertCircleOutline, closeOutline, refreshOutline,
  ellipsisHorizontalCircleOutline, medicalOutline, lockClosedOutline,
  keyOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.page.html',
  styleUrls: ['./supervisor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SupervisorPage implements OnInit {
  vista: string = 'lista';
  lineaSeleccionada: string = 'A';
  empleadoSeleccionado: any = null;
  fechaHoy: string = "";

  isModalOpen: boolean = false;
  modalData: any = {};
  tipoActual: string = '';
  esModoCancelacion: boolean = false;

  personal = [
    { reloj: '26510', nombre: 'Ana Martínez', estado: 'REGISTRADO', claseEstado: 'registrado', linea: 'A' },
    { reloj: '26519', nombre: 'Daniel Olivas', estado: 'PENDIENTE', claseEstado: 'pendiente', linea: 'A' },
    { reloj: '26522', nombre: 'Roberto Solís', estado: 'VACACIONES', claseEstado: 'vacaciones', linea: 'A' },
    { reloj: '26601', nombre: 'Marcos Peña', estado: 'PERMISO', claseEstado: 'permiso', linea: 'B' },
    { reloj: '26605', nombre: 'Sofía Castro', estado: 'INCAPACIDAD', claseEstado: 'incapacidad', linea: 'B' },
    { reloj: '26610', nombre: 'Luis García', estado: 'SUSPENSIÓN', claseEstado: 'suspension', linea: 'B' }
  ];

  excepcionesKeys = ['vacaciones', 'permiso', 'incapacidad', 'suspension'];

  constructor() {
    addIcons({
      logOutOutline, chevronForwardOutline, arrowBackOutline,
      checkmarkCircle, timeOutline, documentTextOutline,
      airplaneOutline, calendarOutline, banOutline,
      documentAttachOutline, alertCircleOutline, closeOutline, refreshOutline,
      ellipsisHorizontalCircleOutline, medicalOutline, lockClosedOutline,
      keyOutline 
    });
  }

  ngOnInit() {
    const opciones: any = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const hoy = new Date().toLocaleDateString('es-MX', opciones);
    this.fechaHoy = hoy.toUpperCase();
  }

  //Logica para el cambio de vista//
  setVista(nuevaVista: string) {
    this.vista = nuevaVista;
  }

  get personalFiltrado() {
    return this.personal.filter(p => p.linea === this.lineaSeleccionada);
  }

  cambiarLinea(linea: string) { this.lineaSeleccionada = linea; }
  
  abrirDetalle(persona: any) { 
    this.empleadoSeleccionado = persona; 
    this.vista = 'detalle'; 
  }

  tieneExcepcionActiva(): boolean { 
    return this.excepcionesKeys.includes(this.empleadoSeleccionado?.claseEstado); 
  }

  getIconoEstadoHoy() {
    const estado = this.empleadoSeleccionado?.claseEstado;
    if (estado === 'pendiente') return 'ellipsis-horizontal-circle-outline';
    if (this.excepcionesKeys.includes(estado)) return 'alert-circle-outline'; 
    return 'checkmark-circle';
  }

  getClaseIconoHoy() {
    const estado = this.empleadoSeleccionado?.claseEstado;
    if (estado === 'pendiente') return 'gray-icon';
    if (this.excepcionesKeys.includes(estado)) return 'blue-icon';
    return 'green-icon';
  }

  abrirModalExcepcion(tipo: string) {
    this.tipoActual = tipo;
    this.esModoCancelacion = this.empleadoSeleccionado.claseEstado === tipo;
    const azulEmpresa = '#1A3D63';

    //Logica para el control de excepciones, si el operador va estar de vacaciones, con permiso
    //Incapacitado, o se le va a levantar un solicitud de suspension
    const excepciones: any = {
      'vacaciones': { 
        nombre: 'vacaciones', 
        icono: 'airplane-outline', 
        color: azulEmpresa, 
        msg: 'El operador quedará marcado como vacaciones y no podrá ser registrado en asistencia mientras esta excepción esté activa.',
        msgCancel: 'Se eliminará el estado de vacaciones del operador y podrá volver a ser registrado en asistencia.'
      },
      'permiso': { 
        nombre: 'permiso', 
        icono: 'calendar-outline', 
        color: azulEmpresa, 
        msg: 'El operador quedará marcado con permiso autorizado y no podrá ser registrado en asistencia mientras esta excepción esté activa.',
        msgCancel: 'Se eliminará el estado de permiso del operador y podrá volver a ser registrado en asistencia.'
      },
      'incapacidad': { 
        nombre: 'incapacidad', 
        icono: 'medical-outline', 
        color: azulEmpresa, 
        msg: 'El operador quedará marcado como incapacitado y no podrá ser registrado en asistencia mientras esta excepción esté activa.',
        msgCancel: 'Se eliminará el estado de incapacidad del operador y podrá volver a ser registrado en asistencia.'
      },
      'suspension': { 
        nombre: 'suspensión', 
        icono: 'ban-outline', 
        color: azulEmpresa, 
        msg: 'Se enviará una solicitud de suspensión a Recursos Humanos.<br>Mientras esté pendiente o activa, el operador no podrá ser registrado en asistencia.',
        msgCancel: 'Se eliminará el estado de suspensión del operador y podrá volver a ser registrado en asistencia.'
      }
    };

    const data = excepciones[tipo];
    
    if (this.esModoCancelacion) {
      const tituloCancel = tipo === 'suspension' ? `Cancelar ${data.nombre}` : 'Terminar estado';
      
      this.modalData = {
        ...data,
        titulo: tituloCancel,
        icono: 'refresh-outline',
        color: azulEmpresa,
        mensaje: data.msgCancel,
        boton: 'CONFIRMAR'
      };
    } else {
      let prefijo = 'Registrar';
      if (tipo === 'suspension') prefijo = 'Solicitar';

      this.modalData = {
        ...data,
        titulo: `${prefijo} ${data.nombre}`,
        mensaje: data.msg, 
        advertencia: 'Solo puede existir una excepción activa a la vez.',
        boton: tipo === 'suspension' ? 'SOLICITAR' : 'CONFIRMAR'
      };
    }
    this.isModalOpen = true;
  }

  confirmarAccion() {
    if (this.esModoCancelacion) {
      this.empleadoSeleccionado.estado = 'PENDIENTE';
      this.empleadoSeleccionado.claseEstado = 'pendiente';
    } else {
      this.empleadoSeleccionado.estado = this.tipoActual === 'suspension' ? 'PENDIENTE RH' : this.tipoActual.toUpperCase();
      this.empleadoSeleccionado.claseEstado = this.tipoActual;
    }
    this.isModalOpen = false;
  }

  cerrarSesion() {
    console.log("Cerrando sesión de supervisor...");
  }
}