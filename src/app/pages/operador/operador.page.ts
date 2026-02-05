import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-operador',
  templateUrl: './operador.page.html',
  styleUrls: ['./operador.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class OperadorPage implements OnInit {
  
  //Menus// 
  view: 'dashboard' | 'password' = 'dashboard';
  
  isKardexOpen: boolean = false;
  meses: string[] = ['Enero 2026', 'Diciembre 2025', 'Noviembre 2025'];

  constructor() { }

  ngOnInit() { }

  //Cambiar de pantalla//
  setView(target: 'dashboard' | 'password') {
    this.view = target;
    if (target === 'password') {
      this.isKardexOpen = false;
    }
  }
}