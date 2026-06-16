import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SuspendidosService } from '../../services/suspendidos.service';
import { UsuariosService } from '../../services/usuarios.service';

import { IonicModule } from '@ionic/angular';
import { BackgroundLayoutComponent } from '../../components/background-layout/background-layout.component';

import { addIcons } from 'ionicons';
import { Usuario } from '../../services/auth.service';
import {
  menuOutline,
  chevronForwardOutline,
  arrowBackOutline,
  documentAttachOutline,
  alertCircleOutline,
  logOutOutline,
  keyOutline,
  checkmarkCircle,
  time,
  closeCircle
} from 'ionicons/icons';

type Vista = 'lista' | 'detalle' | 'kardex' | 'password' | 'menu';
type Semaforo = 'rojo' | 'amarillo' | 'verde';
type Accion = 'aprobar' | 'rechazar';



interface Operador {
  nombre: string;
  nombre_completo: string;
  reloj: number;
  numero_reloj: string;
  linea: string;
  linea_trabajo: string;
  semaforo: Semaforo;
  estado: string;
  estado_solicitud?: string;
  estado_suspension?: string;
  estado_pendiente?: string;
  usuario?: Usuario | null;
  
}

@Component({
  selector: 'app-recursos-humanos',
  templateUrl: './recursos-humanos.page.html',
  styleUrls: ['./recursos-humanos.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    UpperCasePipe,
    BackgroundLayoutComponent
  ]
})
export class RecursosHumanosPage implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  usuario: Usuario | null = null;

  vista: Vista = 'lista';
  fechaHoy = '';
  filtroSemaforo: Semaforo = 'rojo';

  operadorSeleccionado: Operador | null = null;
  detallePendiente = false;
  historialReciente: any[] = [];
  kardexHTML: any = null;

  suspendidos: any[] = [];
  operadores: any[] = [];

  cargando = false;

  constructor(
    private suspendidosService: SuspendidosService,
    private usuariosService: UsuariosService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    addIcons({
      menuOutline,
      chevronForwardOutline,
      arrowBackOutline,
      documentAttachOutline,
      alertCircleOutline,
      logOutOutline,
      keyOutline,
      checkmarkCircle,
      time,
      closeCircle
    });
  }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.setFecha();
  }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setFecha() {
    this.fechaHoy = new Date()
      .toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      .toUpperCase();
  }

  cargarDatos() {
    this.cargando = true;

    forkJoin({
      suspendidos: this.suspendidosService.getSuspendidos(),
      operadores: this.usuariosService.getOperadoresSemaforo()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ suspendidos, operadores }) => {
          this.suspendidos = suspendidos;
          this.operadores = operadores;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
          alert('Error cargando datos');
        }
      });
  }

  refrescar() {
    this.cargarDatos();
  }

  setVista(v: Vista) {
    this.vista = v;
  }

  abrirMenu() {
    this.vista = 'menu';
  }

  setFiltro(color: Semaforo) {
    this.filtroSemaforo = color;
  }

  isFiltro(color: Semaforo) {
    return this.filtroSemaforo === color;
  }

private esPendiente(op: any): boolean {
  const estados = [
    op.estado,
    op.estado_solicitud,
    op.estado_suspension,
    op.estado_pendiente
  ]
    .filter(Boolean)
    .map(e => String(e).toUpperCase());

  return estados.some(e =>
    e.includes('PENDIENTE') ||
    e.includes('SUSPENDIDO')
  );
}

verDetalle(op: any) {
  const reloj = op.reloj || op.numero_reloj;

  const estados = [
    op.estado,
    op.estado_solicitud,
    op.estado_suspension,
    op.estado_pendiente
  ]
    .filter(Boolean)
    .map(e => String(e).toUpperCase());

  const estadoFinal = estados.length
    ? estados.join(' | ')
    : op.motivo
      ? 'SUSPENDIDO'
      : 'DESCONOCIDO';

  this.operadorSeleccionado = {
    ...op,
    nombre: op.nombre || op.nombre_completo || '',
    reloj: op.reloj || op.numero_reloj || '',
    linea: op.linea || op.linea_trabajo || '',
    estado: estadoFinal
  };

  // Evaluar si está pendiente o suspendido
  this.detallePendiente = estadoFinal === 'SUSPENDIDO' ||
    estadoFinal.includes('PENDIENTE');

  this.historialReciente = [];
  this.vista = 'detalle';

  this.http.get<any[]>(`http://localhost:3001/historial-reciente/${reloj}`)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (datos) => this.historialReciente = datos,
      error: () => this.historialReciente = []
    });
}
  
  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  gestionarSuspension(accion: Accion) {
    if (!this.operadorSeleccionado) return;

    const numero = String(this.operadorSeleccionado.reloj || this.operadorSeleccionado.numero_reloj || this.operadorSeleccionado.numero_reloj || '');
    const nombreOperador = this.operadorSeleccionado.nombre_completo || this.operadorSeleccionado.nombre;

    const acciones = {
      aprobar: () => this.suspendidosService.aceptarSuspension(numero),
      rechazar: () => this.suspendidosService.rechazarSuspension(numero)
    };

    acciones[accion]()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          let mensaje = '';
          if (accion === 'aprobar') {
            mensaje = `✅ Suspensión ACEPTADA\n\n${nombreOperador} ha sido BLOQUEADO.\nNO podrá entrar en su cuenta.`;
          } else {
            mensaje = `✅ Suspensión RECHAZADA\n\n${nombreOperador} ha sido DESBLOQUEADO.\nYa puede entrar en su cuenta.`;
          }
          alert(mensaje);
          this.refrescar();
          this.setVista('lista');
        },
        error: (err) => {
          alert(`❌ Error: ${err?.error?.message || 'No se pudo procesar la solicitud'}`);
        }
      });
  }

  // ================= COMPUTED =================
  get solicitudesPendientes() {
    return this.operadores.filter(op => op.estado === 'PENDIENTE RH');
  }

  get listaSuspendidos() {
    return this.suspendidos;
  }

  get listaFiltrada() {
    return this.operadores.filter(op =>
      op.semaforo === this.filtroSemaforo &&
      (op.estado === 'ACTIVO' || op.estado === 'SUSPENDIDO' || op.estado === 'PENDIENTE RH')
    );
  }

  trackByReloj(index: number, item: any) {
    return item.reloj || item.numero_reloj;
  }

  generarReporte() {
    const tipo = this.filtroSemaforo;
    
    if (this.cargando) {
      alert('Ya hay un reporte generándose, por favor espera');
      return;
    }

    this.cargando = true;

    fetch(`http://localhost:3001/rrhh/reporte/generar?filtro=${tipo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Validar que la respuesta sea correcta
        if (data.ok && data.datos && data.datos.length > 0) {
          // Solo abrir ventana si hay datos
          const ventana = window.open('', '_blank');
          if (ventana) {
            this.escribirReportePDF(ventana, data, tipo);
            console.log(`✅ Reporte ${tipo} generado exitosamente`);
          } else {
            alert('Popup bloqueado. Por favor, permite popups en tu navegador');
          }
        } else {
          // No hay datos - solo mostrar alerta, sin abrir ventana
          alert(`⚠️ No hay datos para el reporte ${tipo}`);
        }
      })
      .catch(error => {
        console.error('Error generando reporte:', error);
        alert(`❌ Error generando reporte: ${error.message}`);
      })
      .finally(() => {
        this.cargando = false;
      });
  }

  private escribirReportePDF(ventana: Window, data: any, tipo: string) {
    // Crear tabla HTML desde los datos
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte ${tipo.toUpperCase()}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { 
            color: #333; 
            border-bottom: 3px solid #${tipo === 'rojo' ? 'ff0000' : tipo === 'amarillo' ? 'ffaa00' : '00aa00'}; 
            padding-bottom: 10px; 
          }
          .header-info {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            color: #666;
            font-size: 14px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #${tipo === 'rojo' ? 'ffebee' : tipo === 'amarillo' ? 'fff3e0' : 'e8f5e9'}; 
            font-weight: bold;
            color: #${tipo === 'rojo' ? 'c62828' : tipo === 'amarillo' ? 'd84315' : '1b5e20'};
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          .dot { 
            display: inline-block; 
            width: 12px; 
            height: 12px; 
            border-radius: 50%; 
            margin-right: 8px; 
            vertical-align: middle;
          }
          .dot--rojo { background-color: #ff0000; }
          .dot--amarillo { background-color: #ffaa00; }
          .dot--verde { background-color: #00aa00; }
          .footer { 
            color: #999; 
            font-size: 12px; 
            margin-top: 20px; 
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          .print-btn {
            background: #2196F3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .print-btn:hover {
            background: #1976D2;
          }
          @media print {
            .print-btn { display: none; }
            body { margin: 0; background: white; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1><span class="dot dot--${tipo}"></span>Reporte ${tipo.toUpperCase()}</h1>
          <div class="header-info">
            <div>
              <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div>
              <strong>Generado por:</strong> ${this.usuario?.nombre || 'Sistema'}
            </div>
          </div>
          
          <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
          
          <p><strong>Total de operadores:</strong> ${data.total}</p>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Reloj</th>
                <th>Nombre</th>
                <th>Línea</th>
                <th>Faltas</th>
                <th>Retardos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
    `;

    data.datos.forEach((row: any, index: number) => {
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${row.numero_reloj}</td>
          <td>${row.nombre_completo}</td>
          <td>${row.linea_trabajo}</td>
          <td style="color: #c62828; font-weight: bold;">${row.faltas || 0}</td>
          <td style="color: #f57c00; font-weight: bold;">${row.retardos || 0}</td>
          <td>${row.estado}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
          
          <div class="footer">
            <p>Reporte generado automáticamente por PrediSemaforo - ${new Date().toLocaleString('es-MX')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    ventana.document.write(html);
    ventana.document.close();
  }

  // ================= KARDEX =================
  verKardexEnPagina() {
    if (!this.operadorSeleccionado) return alert('Selecciona un operador');

    const numero = this.operadorSeleccionado.reloj || this.operadorSeleccionado.numero_reloj;
    this.http.get<any>(`http://localhost:3001/kardex/${numero}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (datos) => {
          this.generarVistasKardex(datos);
          this.setVista('kardex');
        },
        error: () => {
          alert('Kardex no disponible');
        }
      });
  }

  private generarVistasKardex(datos: any) {
    const estilos = `
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px;
          background: #f1f5f9;
        }
        .kardex-container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          max-width: 900px;
          margin: 0 auto;
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .header-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 15px;
        }
        .info-item {
          background: rgba(255,255,255,0.2);
          padding: 10px;
          border-radius: 6px;
          font-size: 13px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #e2e8f0;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #1e293b;
          border-bottom: 2px solid #cbd5e1;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:hover {
          background: #f8fafc;
        }
        .fecha { font-weight: 600; color: #475569; }
        .estado-puntual { color: #22c55e; font-weight: 600; }
        .estado-retardo { color: #facc15; font-weight: 600; }
        .estado-falta { color: #ef4444; font-weight: 600; }
        .semaforo {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .semaforo-verde { background: #dcfce7; color: #166534; }
        .semaforo-amarillo { background: #fef3c7; color: #92400e; }
        .semaforo-rojo { background: #fee2e2; color: #991b1b; }
      </style>
    `;

    const kardexBody = `
      <div class="kardex-container">
        <div class="header">
          <h1>📋 Kardex Completo</h1>
          <div class="header-info">
            <div class="info-item"><strong>Nombre:</strong> ${datos.nombre}</div>
            <div class="info-item"><strong>Reloj:</strong> ${datos.numero_reloj}</div>
            <div class="info-item"><strong>Rol:</strong> ${datos.rol}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Semáforo</th>
            </tr>
          </thead>
          <tbody>
            ${datos.historial.map((item: any) => {
              const clase = item.estado === 'PUNTUAL' ? 'estado-puntual' : 
                             item.estado === 'RETARDO' ? 'estado-retardo' : 'estado-falta';
              const semaforo = item.estado === 'PUNTUAL' ? 'semaforo-verde' : 
                               item.estado === 'RETARDO' ? 'semaforo-amarillo' : 'semaforo-rojo';
              return `
                <tr>
                  <td class="fecha">${new Date(item.fecha).toLocaleDateString('es-MX')}</td>
                  <td class="${clase}">${item.estado}</td>
                  <td><span class="semaforo ${semaforo}">${item.estado}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.kardexHTML = this.sanitizer.bypassSecurityTrustHtml(estilos + kardexBody);
  }
}