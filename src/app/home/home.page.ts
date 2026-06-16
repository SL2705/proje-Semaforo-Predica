import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  AlertController, ToastController, ActionSheetController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class HomePage implements OnInit {
  activeUsers: Observable<number> = of(12);
  totalRoles: Observable<number> = of(5);
  unreadNotifications: number = 3; // Número de notificaciones no leídas

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    // Aquí puedes cargar datos del backend si lo necesitas
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  async showRestrictedAccess(section: string) {
    const alert = await this.alertController.create({
      header: 'Acceso Restringido',
      message: `Solo el equipo de soporte técnico y sistemas puede acceder a ${section}. Debes identificarte en el inicio de sesión para continuar.`,
      buttons: [
        {
          text: 'Entendido',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  // Funcionalidades de Accesos Rápidos
  async openHelp() {
    const alert = await this.alertController.create({
      header: 'Centro de Ayuda',
      message: `
        ¿Necesitas ayuda? 
        Contacta con soporte técnico o con el administrador del sistema
        para recibir asistencia.
      `,
      buttons: [
        {
          text: 'Contactar Soporte',
          handler: () => {
            this.contactarSoporte();
          }
        },
        {
          text: 'Entendido',
          role: 'cancel'
        }
      ],
      cssClass: 'help-alert'
    });

    await alert.present();
  }

  async contactarSoporte() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Contactar Soporte Técnico',
      buttons: [
        {
          text: 'Enviar Email',
          handler: () => {
            window.location.href = 'mailto:soporte@sistemas.com?subject=Solicitud de Soporte &body=Describe tu problema aquí...';
            this.showToast('Abriendo cliente de email...', 'primary');
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async openDocumentation() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Centro de Documentación',
      buttons: [
        {
          text: 'Manual de Usuario',
          handler: () => {
            this.openManualPdf();
          }
        },
        {
          text: 'Documentación API',
          handler: () => {
            this.openApiDocumentation();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  private openManualPdf() {
    const url = 'http://localhost:3001/manual-pdf';

      window.open(url, '_blank');
  }

  async openApiDocumentation() {
  const alert = await this.alertController.create({
    header: 'Documentación API',
    message: 'Guía técnica para desarrolladores.',
    buttons: [
      {
        text: 'Abrir documentación',
        handler: () => {

         const url = 'http://localhost:3001/api-docs-pdf';

          window.open(url, '_blank');

          this.showToast('Abriendo documentación API...', 'primary');
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ]
  });

  await alert.present();
}


  async openSystemStatus() {
    const alert = await this.alertController.create({
      header: 'Estado del Sistema',
      message: `
        <div style="text-align: left;">
          <strong>Base de Datos:</strong> Conectada<br>
          <strong>Servidor Backend:</strong> Operativo<br>
          <strong>Autenticación:</strong> Funcionando<br>
          <strong>Espacio en Disco:</strong> 78% utilizado<br>
          <strong>Memoria RAM:</strong> 45% utilizada<br><br>
          <em>Última actualización: ${new Date().toLocaleTimeString()}</em>
        </div>
      `,
      buttons: [
        {
          text: 'Actualizar',
          handler: () => {
            this.showToast('Actualizando estado del sistema...', 'primary');
          }
        },
        {
          text: 'Ver Detalles',
          handler: () => {
            this.showToast('Abriendo panel de monitoreo...', 'secondary');
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ],
      cssClass: 'status-alert'
    });

    await alert.present();
  }

  async openQuickSettings() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Configuración Rápida',
      buttons: [
        {
          text: 'Tema de la Interfaz',
          handler: () => {
            this.showToast('Cambiando tema...', 'primary');
          }
        },
        {
          text: 'Notificaciones',
          handler: () => {
            this.showToast('Configurando notificaciones...', 'secondary');
          }
        },
        {
          text: 'Seguridad',
          handler: () => {
            this.showToast('Abriendo configuración de seguridad...', 'warning');
          }
        },
        {
          text: 'Almacenamiento',
          handler: () => {
            this.showToast('Verificando almacenamiento...', 'tertiary');
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async viewSystemLogs() {
    const alert = await this.alertController.create({
      header: 'Logs del Sistema',
      message: `
        <div style="text-align: left; font-family: monospace; font-size: 12px; background: #f8fafc; padding: 10px; border-radius: 8px;">
          [2024-01-15 10:30:15] INFO: Usuario admin inició sesión<br>
          [2024-01-15 10:31:22] INFO: Nuevo usuario registrado: user123<br>
          [2024-01-15 10:32:05] WARN: Intento de acceso denegado<br>
          [2024-01-15 10:33:18] INFO: Backup automático completado<br>
          [2024-01-15 10:34:01] INFO: Kardex actualizado para empleado #456<br>
        </div>
        <br>
        <em>Mostrando últimas 5 entradas del log.</em>
      `,
      buttons: [
        {
          text: 'Ver Todos los Logs',
          handler: () => {
            this.showToast('Abriendo visor completo de logs...', 'primary');
          }
        },
        {
          text: 'Exportar',
          handler: () => {
            this.showToast('Exportando logs del sistema...', 'secondary');
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ],
      cssClass: 'logs-alert'
    });

    await alert.present();
  }

  async openBackupManager() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Backup & Restore',
      buttons: [
        {
          text: 'Crear Backup',
          handler: () => {
            this.showToast('Iniciando backup del sistema...', 'success');
          }
        },
        {
          text: 'Restaurar Backup',
          handler: () => {
            this.showToast('Abriendo selector de backup...', 'warning');
          }
        },
        {
          text: 'Historial de Backups',
          handler: () => {
            this.showToast('Mostrando historial de backups...', 'primary');
          }
        },
        {
          text: 'Backup en la Nube',
          handler: () => {
            this.showToast('Configurando backup automático...', 'tertiary');
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async openNotifications() {
    const alert = await this.alertController.create({
      header: 'Centro de Notificaciones',
      message: `
        <div style="text-align: left;">
          <strong>Notificaciones Recientes:</strong><br><br>
          • <strong>Nuevo usuario registrado:</strong> Juan Pérez<br>
          • <strong>Backup completado:</strong> Sistema respaldado exitosamente<br>
          • <strong>Actualización disponible:</strong> Versión 2.1.0 lista<br><br>
          <em>Tienes ${this.unreadNotifications} notificaciones sin leer</em>
        </div>
      `,
      buttons: [
        {
          text: 'Marcar como Leídas',
          handler: () => {
            this.unreadNotifications = 0;
            this.showToast('Todas las notificaciones marcadas como leídas', 'success');
          }
        },
        {
          text: 'Ver Todas',
          handler: () => {
            this.showToast('Abriendo panel de notificaciones...', 'primary');
          }
        },
        {
          text: 'Configurar',
          handler: () => {
            this.showToast('Abriendo configuración de notificaciones...', 'secondary');
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ],
      cssClass: 'notifications-alert'
    });

    await alert.present();
  }

  async openReports() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Reportes y Estadísticas',
      buttons: [
        {
          text: 'Dashboard General',
          handler: () => {
            this.showToast('Abriendo dashboard principal...', 'primary');
          }
        },
        {
          text: 'Reporte de Usuarios',
          handler: () => {
            this.showToast('Generando reporte de usuarios...', 'secondary');
          }
        },
        {
          text: 'Estadísticas de Uso',
          handler: () => {
            this.showToast('Cargando estadísticas del sistema...', 'tertiary');
          }
        },
        {
          text: 'Reporte de Actividad',
          handler: () => {
            this.showToast('Generando reporte de actividad...', 'warning');
          }
        },
        {
          text: 'Exportar Reportes',
          handler: () => {
            this.showToast('Preparando exportación de reportes...', 'success');
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  // Método auxiliar para mostrar toasts
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}