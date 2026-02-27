import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundLayoutComponent } from '../../shared/background-layout/background-layout.component';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButton,
  IonIcon, // <--- IMPORTANTE: Esto le falta a Leo
  IonLabel
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonLabel,
    BackgroundLayoutComponent
  ]
})
export class LoginPage implements OnInit {

  showPassword = false;

  constructor() { }

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    console.log('Intento de login');
  }
}
