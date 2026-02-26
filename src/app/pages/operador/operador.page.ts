import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, checkmarkCircle, timeOutline, 
  documentTextOutline, keyOutline, arrowBackOutline,
  menuOutline, megaphoneOutline, shieldCheckmarkOutline,
  helpCircleOutline, chevronForwardOutline, closeOutline
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
      documentTextOutline, keyOutline, arrowBackOutline,
      menuOutline, megaphoneOutline, shieldCheckmarkOutline,
      helpCircleOutline, chevronForwardOutline, closeOutline
    });
  }

  //Cambiar de vista//
  setView(newView: string) {
    this.view = newView;
  }

  cerrarSesion() {
    //Lógica para salir//
    console.log("Cerrando sesión...");
  }
}