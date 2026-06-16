import { Component, OnInit } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIf, NgFor, NgClass, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


import { UsuariosService } from '../../services/usuarios.service';
import { AsistenciasService, Asistencia } from '../../services/asistencias.service';
import { AsistenciaHoyService, AsistenciaHoy } from '../../services/asistencia-hoy.service';
import { HttpClient } from '@angular/common/http';
import { BackgroundLayoutComponent } from '../../shared/background-layout/background-layout.component';

import { addIcons } from 'ionicons';
import {
  logOutOutline, chevronForwardOutline, arrowBackOutline,
  checkmarkCircle, timeOutline, documentTextOutline,
  airplaneOutline, calendarOutline, banOutline,
  documentAttachOutline, alertCircleOutline, closeOutline,
  refreshOutline, ellipsisHorizontalCircleOutline, medicalOutline,
  lockClosedOutline, keyOutline, menuOutline, megaphoneOutline,
  shieldCheckmarkOutline, helpCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.page.html',
  styleUrls: ['./supervisor.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    BackgroundLayoutComponent,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    UpperCasePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SupervisorPage implements OnInit {
  // ========== EXCEPCIONES ==========
  registrarVacaciones() {
    const numero_reloj = this.empleadoSeleccionado?.reloj;
    const fecha_inicio = prompt('Fecha inicio (YYYY-MM-DD):');
    const fecha_fin = prompt('Fecha fin (YYYY-MM-DD):');
    const dias = Number(prompt('Días:'));
    const comentario = prompt('Comentario:');
    if (!numero_reloj || !fecha_inicio || !fecha_fin || !dias) return alert('Datos incompletos');
    this.http.post('http://localhost:3001/vacaciones', {
      numero_reloj, fecha_inicio, fecha_fin, dias, comentario
    }).subscribe({
      next: (resp: any) => alert(resp?.message || 'Vacaciones registradas'),
      error: (err: any) => alert(err?.error?.message || 'Error registrando vacaciones')
    });
  }

  registrarPermiso() {
    const numero_reloj = this.empleadoSeleccionado?.reloj;
    const fecha = prompt('Fecha (YYYY-MM-DD):');
    const hora_inicio = prompt('Hora inicio (HH:mm:ss):');
    const hora_fin = prompt('Hora fin (HH:mm:ss):');
    const tipo = prompt('Tipo:');
    const motivo = prompt('Motivo:');
    if (!numero_reloj || !fecha || !hora_inicio || !hora_fin || !tipo || !motivo) return alert('Datos incompletos');
    this.http.post('http://localhost:3001/permisos', {
      numero_reloj, fecha, hora_inicio, hora_fin, tipo, motivo
    }).subscribe({
      next: (resp: any) => alert(resp?.message || 'Permiso registrado'),
      error: (err: any) => alert(err?.error?.message || 'Error registrando permiso')
    });
  }

  registrarIncapacidad() {
    const numero_reloj = this.empleadoSeleccionado?.reloj;
    const fecha_inicio = prompt('Fecha inicio (YYYY-MM-DD):');
    const fecha_fin = prompt('Fecha fin (YYYY-MM-DD):');
    const tipo = prompt('Tipo:');
    const documento = prompt('Documento:');
    if (!numero_reloj || !fecha_inicio || !fecha_fin || !tipo) return alert('Datos incompletos');
    this.http.post('http://localhost:3001/incapacidades', {
      numero_reloj, fecha_inicio, fecha_fin, tipo, documento
    }).subscribe({
      next: (resp: any) => alert(resp?.message || 'Incapacidad registrada'),
      error: (err: any) => alert(err?.error?.message || 'Error registrando incapacidad')
    });
  }

  registrarSuspension() {
    const numero_reloj = this.empleadoSeleccionado?.reloj;
    const motivo = prompt('Motivo:');
    if (!numero_reloj || !motivo) return alert('Datos incompletos');
    this.http.post('http://localhost:3001/suspensiones', {
      numero_reloj,
      motivo,
      enviado_por: 'Supervisor',
      bloquear_cuenta: true
    }).subscribe({
      next: (resp: any) => alert(resp?.message || 'Suspensión registrada'),
      error: (err: any) => alert(err?.error?.message || 'Error registrando suspensión')
    });
  }

  confirmarAccion() {
    this.excepcionError = '';

    const config: any = {
      vacaciones: 'vacaciones',
      permiso: 'permisos',
      incapacidad: 'incapacidades',
      suspension: 'suspensiones'
    };

    const endpoint = config[this.tipoActual];
    const reloj = this.empleadoSeleccionado?.reloj;

    if (!reloj) {
      this.excepcionError = 'No hay operador seleccionado';
      return;
    }

    // validar campos
    for (const f of this.modalData.fields) {
      if (!this.excepcionForm[f.key]) {
        this.excepcionError = `Falta: ${f.label}`;
        return;
      }
    }

    const payload = {
      numero_reloj: reloj,
      ...this.excepcionForm
    };

    this.http.post(`http://localhost:3001/${endpoint}`, payload)
      .subscribe({
        next: () => {
          alert('Registro guardado correctamente');
          this.isModalOpen = false;
          this.excepcionForm = {};
        },
        error: (err: any) => {
          this.excepcionError = err?.error?.message || 'Error en servidor';
        }
      });
  }

  irAKardex() {
    const reloj = this.empleadoSeleccionado?.reloj;
    if (!reloj) return;
    this.router.navigate(['/kardex', reloj]);
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  vista: string = 'lista';
  lineaSeleccionada: string = 'A';

  empleadoSeleccionado: any = null;
  fechaHoy: string = '';

  personal: any[] = [];
  historial: Asistencia[] = [];

  excepcionesKeys = ['vacaciones', 'permiso', 'incapacidad', 'suspension'];

  // asistencia hoy
  asistenciaHoy: AsistenciaHoy | null = null;
  mensajeAsistenciaHoy: string = '';

  // modal
  isModalOpen: boolean = false;
  modalData: any = {};
  tipoActual: string = '';
  esModoCancelacion: boolean = false;
  excepcionForm: any = {};
  excepcionError: string = '';

  constructor(
    private usuariosService: UsuariosService,
    private asistenciasService: AsistenciasService,
    private asistenciaHoyService: AsistenciaHoyService,
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({
      logOutOutline, chevronForwardOutline, arrowBackOutline,
      checkmarkCircle, timeOutline, documentTextOutline,
      airplaneOutline, calendarOutline, banOutline,
      documentAttachOutline, alertCircleOutline, closeOutline,
      refreshOutline, ellipsisHorizontalCircleOutline, medicalOutline,
      lockClosedOutline, keyOutline, menuOutline, megaphoneOutline,
      shieldCheckmarkOutline, helpCircleOutline
    });
  }

  ngOnInit() {
    const opciones: any = {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    };
    this.fechaHoy = new Date()
      .toLocaleDateString('es-MX', opciones)
      .toUpperCase();
  }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.usuariosService.getUsuarios().subscribe(
      (usuarios) => {
        const operadores = usuarios
          .filter(u =>
            u.rol === 'operador' &&
            (u.linea_trabajo === 'Linea A' || u.linea_trabajo === 'Linea B')
          )
          .map(u => ({
            reloj: u.numero_reloj,
            nombre: u.nombre_completo,
            estado: u.rol.toUpperCase(),
            claseEstado: 'registrado',
            linea: u.linea_trabajo === 'Linea A' ? 'A' : 'B',
            semaforo: 'gris' // default
          }));

        // Para cada operador, obtener historial y calcular semáforo
        operadores.forEach(op => {
          this.asistenciasService.getHistorial(op.reloj).subscribe((historial) => {
            const faltas = historial.filter(a => a.puntualidad === 'FALTA').length;
            if (faltas >= 3) {
              op.semaforo = 'rojo';
            } else if (faltas === 2 || faltas === 1) {
              op.semaforo = 'amarillo';
            } else {
              op.semaforo = 'verde';
            }
          });
        });
        this.personal = operadores;
      },
      (error) => console.error(error)
    );
  }

  // ======================
  // VISTAS
  // ======================

  setVista(v: string) {
    this.vista = v;
  }

  get personalFiltrado() {
    return this.personal.filter(p => p.linea === this.lineaSeleccionada);
  }

  cambiarLinea(linea: string) {
    this.lineaSeleccionada = linea;
  }

  abrirDetalle(persona: any) {
    this.empleadoSeleccionado = persona;
    this.historial = [];
    this.vista = 'detalle';

    this.asistenciasService.getHistorial(persona.reloj).subscribe(
      (data) => this.historial = data,
      (error) => console.error(error)
    );
  }

  // ======================
  // ASISTENCIA HOY (BOTÓN)
  // ======================

  corregirRegistroHoy() {
    this.mensajeAsistenciaHoy = '';
    this.asistenciaHoy = null;

    const reloj = this.empleadoSeleccionado?.reloj;

    if (!reloj) {
      this.mensajeAsistenciaHoy = 'No hay operador seleccionado.';
      return;
    }

    this.asistenciaHoyService.getAsistenciaHoy(reloj).subscribe({
      next: (data) => {
        this.asistenciaHoy = data;
        alert('Registro encontrado. Listo para edición.');
      },
      error: (err) => {
        if (err.status === 404) {
          this.mensajeAsistenciaHoy = 'No hay registro de asistencia para hoy.';
        } else {
          this.mensajeAsistenciaHoy = 'Error consultando asistencia.';
        }
      }
    });
  }

  actualizarAsistenciaHoy(nuevoEstado: 'PUNTUAL' | 'RETARDO' | 'FALTA') {
    if (!this.asistenciaHoy) return;
    const id = this.asistenciaHoy.id;
    this.http.patch(`http://localhost:3001/asistencias/${id}`, { puntualidad: nuevoEstado }).subscribe({
      next: () => {
        this.mensajeAsistenciaHoy = 'Registro actualizado correctamente.';
        this.asistenciaHoy = { ...this.asistenciaHoy!, puntualidad: nuevoEstado };
        // Opcional: refrescar historial
        this.abrirDetalle(this.empleadoSeleccionado);
      },
      error: () => {
        this.mensajeAsistenciaHoy = 'Error actualizando el registro.';
      }
    });
  }

  // ======================
  // EXCEPCIONES
  // ======================

  tieneExcepcionActiva(): boolean {
    return this.excepcionesKeys.includes(this.empleadoSeleccionado?.claseEstado);
  }

  abrirModalExcepcion(tipo: string) {
  this.tipoActual = tipo;
  this.excepcionForm = {};
  this.excepcionError = '';
  this.esModoCancelacion = this.empleadoSeleccionado?.claseEstado === tipo;

  const config: any = {
    vacaciones: {
      nombre: 'Vacaciones',
      icono: 'airplane-outline',
      endpoint: 'vacaciones',
      fields: [
        { key: 'fecha_inicio', label: 'Fecha inicio', type: 'date' },
        { key: 'fecha_fin', label: 'Fecha fin', type: 'date' },
        { key: 'dias', label: 'Días', type: 'number' },
        { key: 'comentario', label: 'Comentario', type: 'text' }
      ]
    },
    permiso: {
      nombre: 'Permiso',
      icono: 'calendar-outline',
      endpoint: 'permisos',
      fields: [
        { key: 'fecha', label: 'Fecha', type: 'date' },
        { key: 'hora_inicio', label: 'Hora inicio', type: 'time' },
        { key: 'hora_fin', label: 'Hora fin', type: 'time' },
        { key: 'tipo', label: 'Tipo', type: 'text' },
        { key: 'motivo', label: 'Motivo', type: 'text' }
      ]
    },
    incapacidad: {
      nombre: 'Incapacidad',
      icono: 'medical-outline',
      endpoint: 'incapacidades',
      fields: [
        { key: 'fecha_inicio', label: 'Fecha inicio', type: 'date' },
        { key: 'fecha_fin', label: 'Fecha fin', type: 'date' },
        { key: 'tipo', label: 'Tipo', type: 'text' },
        { key: 'documento', label: 'Documento', type: 'text' }
      ]
    },
    suspension: {
      nombre: 'Suspensión',
      icono: 'ban-outline',
      endpoint: 'suspensiones',
      fields: [
        { key: 'motivo', label: 'Motivo', type: 'text' }
      ]
    }
  };

  const data = config[tipo];

  this.modalData = {
    ...data,
    titulo: this.esModoCancelacion
      ? `Cancelar ${data.nombre}`
      : `Registrar ${data.nombre}`,
    boton: 'GUARDAR',
    color: '#1A3D63'
  };

  this.isModalOpen = true;
}
onClickVacaciones() {
  console.log('CLICK VACACIONES');

  this.abrirModalExcepcion('vacaciones');
}
}
