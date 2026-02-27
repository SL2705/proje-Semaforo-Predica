import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  imports: [IonicModule, CommonModule, FormsModule]
})
export class JefeGrupoPage implements OnInit {

  vista: string = 'lista';
  usuario: any = {};

  // ✅ Sin tilde para que coincida con BD
  LINEAS: string[] = ["Linea A", "Linea B"];
  lineaSeleccionada: string = "Linea A";

  fechaHoy: string = "";
  operadorActual: any = null;
  asistenciaSeleccionada: boolean = true;

  operadores: any[] = [];

  private API_URL = "http://localhost:3000";

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

    const hoy = new Date().toLocaleDateString('es-MX', opciones);
    this.fechaHoy = hoy.toUpperCase();

    this.cargarOperadores();
  }

  // ✅ Solo cambia línea y recarga
  seleccionarLinea(linea: string) {
    this.lineaSeleccionada = linea;
    this.cargarOperadores();
  }

  // ✅ Carga desde backend correctamente
  cargarOperadores() {

    this.http.get<any[]>(
      `${this.API_URL}/operadores/${this.lineaSeleccionada}`
    ).subscribe(data => {

      this.operadores = data.map(op => ({
        id: op.numero_reloj,
        nombre_completo: op.nombre_completo,
        numero_reloj: op.numero_reloj,
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

  // ✅ Getter correcto
  get filtrados() {
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
    if (this.operadorActual) {
      this.operadorActual.listo = true;
      this.vista = 'lista';
    }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
