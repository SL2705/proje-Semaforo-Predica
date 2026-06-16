import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.page.html',
  styleUrls: ['./supervisor.page.scss'],
})
export class SupervisorPage implements OnInit {

  // 🔹 URL BACKEND
  private BASE_URL = 'http://localhost:3001';

  // 🔹 VISTAS
  vista: string = 'lista';

  // 🔹 DATOS
  fechaHoy: string = '';
  lineaSeleccionada: string = 'A';

  personal: any[] = [];
  personalFiltrado: any[] = [];

  empleadoSeleccionado: any = null;

  // 🔹 MODAL
  isModalOpen: boolean = false;
  tipoActual: string = '';

  // 🔹 VACACIONES
  fechaInicio: string = '';
  fechaFin: string = '';
  observaciones: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.obtenerFecha();
    this.cargarPersonal();
  }

  // ==============================
  // 📅 FECHA
  // ==============================
  obtenerFecha() {
    const hoy = new Date();
    this.fechaHoy = hoy.toLocaleDateString();
  }

  // ==============================
  // 👥 CARGAR PERSONAL (SIMULADO)
  // ==============================
  cargarPersonal() {
    this.personal = [
      { nombre: 'Juan Pérez', reloj: '123', estado: 'PUNTUAL', linea: 'A', claseEstado: 'puntual' },
      { nombre: 'Ana López', reloj: '456', estado: 'RETARDO', linea: 'A', claseEstado: 'retardo' },
      { nombre: 'Carlos Ruiz', reloj: '789', estado: 'FALTA', linea: 'B', claseEstado: 'falta' }
    ];

    this.filtrarPersonal();
  }

  filtrarPersonal() {
    this.personalFiltrado = this.personal.filter(p => p.linea === this.lineaSeleccionada);
  }

  cambiarLinea(linea: string) {
    this.lineaSeleccionada = linea;
    this.filtrarPersonal();
  }

  // ==============================
  // 👤 DETALLE
  // ==============================
  abrirDetalle(persona: any) {
    this.empleadoSeleccionado = persona;
    this.vista = 'detalle';
  }

  setVista(v: string) {
    this.vista = v;
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  // ==============================
  // ⚠️ EXCEPCIONES
  // ==============================
  abrirModalExcepcion(tipo: string) {
    this.tipoActual = tipo;
    this.isModalOpen = true;
  }

  confirmarAccion() {

    if (!this.empleadoSeleccionado) return;

    // 🔹 VACACIONES
    if (this.tipoActual === 'vacaciones') {

      const data = {
        reloj: this.empleadoSeleccionado.reloj,
        fecha_inicio: this.fechaInicio,
        fecha_fin: this.fechaFin,
        observaciones: this.observaciones
      };

      console.log("Enviando vacaciones:", data);

      this.http.post(`${this.BASE_URL}/vacaciones`, data)
        .subscribe({
          next: (res) => {
            console.log("Guardado:", res);

            this.empleadoSeleccionado.estado = 'VACACIONES';
            this.empleadoSeleccionado.claseEstado = 'vacaciones';

            this.isModalOpen = false;
            this.limpiarFormulario();
          },
          error: (err) => {
            console.error("Error:", err);
            alert("Error al guardar vacaciones");
          }
        });

      return;
    }

    // 🔹 OTROS (PERMISO / INCAPACIDAD)
    this.empleadoSeleccionado.estado = this.tipoActual.toUpperCase();
    this.empleadoSeleccionado.claseEstado = this.tipoActual;

    this.isModalOpen = false;
  }

  limpiarFormulario() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.observaciones = '';
  }

  // ==============================
  // 🧠 FUNCIONES QUE TE FALLABAN
  // ==============================

  tieneExcepcionActiva(): boolean {
    if (!this.empleadoSeleccionado) return false;

    return ['VACACIONES', 'PERMISO', 'INCAPACIDAD']
      .includes(this.empleadoSeleccionado.estado);
  }

  getIconoEstadoHoy(): string {
    if (!this.empleadoSeleccionado) return 'help-outline';

    switch (this.empleadoSeleccionado.estado) {
      case 'PUNTUAL': return 'checkmark-circle';
      case 'RETARDO': return 'time-outline';
      case 'FALTA': return 'close-circle';
      case 'VACACIONES': return 'airplane-outline';
      case 'PERMISO': return 'calendar-outline';
      case 'INCAPACIDAD': return 'medical-outline';
      default: return 'help-outline';
    }
  }

  getClaseIconoHoy(): string {
    if (!this.empleadoSeleccionado) return '';

    switch (this.empleadoSeleccionado.estado) {
      case 'PUNTUAL': return 'icono-verde';
      case 'RETARDO': return 'icono-amarillo';
      case 'FALTA': return 'icono-rojo';
      case 'VACACIONES': return 'icono-azul';
      case 'PERMISO': return 'icono-morado';
      case 'INCAPACIDAD': return 'icono-naranja';
      default: return '';
    }
  }

  verKardexEmpleado() {
    console.log("Empleado:", this.empleadoSeleccionado);
    alert("Aquí puedes abrir el kardex después");
  }

}