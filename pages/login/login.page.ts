import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController } from '@ionic/angular';
import {
  IonContent, IonButton, IonInput,
  IonHeader, IonToolbar, IonTitle, IonIcon
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonInput, IonIcon,
    FormsModule, CommonModule
  ]
})
export class LoginPage {

  numeroReloj: string = '';
  password: string = '';
  showPassword: boolean = false;

  // Cambia esta IP según tu PC o servidor
  private BASE_URL = 'http://192.168.1.13:3000';

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    const numero = this.numeroReloj.trim();
    const pass = this.password.trim();

    if (!numero || !pass) {
      this.showToast('Debe ingresar número de reloj y contraseña');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Verificando usuario...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      const res: any = await this.http.post(
        `${this.BASE_URL}/login`,
        { numeroReloj: numero, password: pass }
      ).toPromise();

      await loading.dismiss();

      if (!res || !res.numero_reloj) {
        this.showToast('Credenciales incorrectas');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify(res));

      const rutas: any = {
        operador: '/operador',
        supervisor: '/supervisor',
        rrhh: '/rrhh',
        jefe_grupo: '/jefe',
        sistemas: '/sistemas'
      };

      this.router.navigate([rutas[res.rol] || '/home']);

    } catch (err: any) {
      await loading.dismiss();
      console.error('LOGIN FRONT ERROR:', err);

      if (err.status === 401) this.showToast('Usuario o contraseña incorrectos');
      else if (err.status === 400) this.showToast('Faltan datos obligatorios');
      else this.showToast('No se pudo conectar con el servidor');
    }
  }

  async showToast(message: string, color: 'danger' | 'success' = 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }
}