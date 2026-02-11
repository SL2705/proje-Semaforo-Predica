import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, checkmarkCircle, timeOutline, 
  documentTextOutline, keyOutline, arrowBackOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-operador',
  templateUrl: './operador.page.html',
  styleUrls: ['./operador.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class OperadorPage {
  view: string = 'dashboard';

  constructor() {
    addIcons({ 
      logOutOutline, checkmarkCircle, timeOutline, 
      documentTextOutline, keyOutline, arrowBackOutline 
    });
  }

  setView(newView: string) {
    this.view = newView;
  }

  cerrarSesion() {
    console.log("Cerrando sesión del operador...");
    // Aquí redirigirías al login: this.navCtrl.navigateRoot('/login');
  }
}