import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class RegistroPage implements OnInit {

  rol: string = '';
  nombre: string = '';
  numero_reloj: string = '';
  password: string = '';
  linea: string = '';
  lineasCargo: string = '';
  departamento: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {}

registrar() {
  console.log("Enviando datos...");

  const datos = {
    rol: this.rol,
    nombre_completo: this.nombre,
    numero_reloj: this.numero_reloj,
    password: this.password,
    linea: this.linea,
    lineas_cargo: this.lineasCargo,
    departamento: this.departamento
  };

  // Mostramos los datos antes de enviarlos
  console.log("Datos a enviar:", datos);

  // Validación rápida para ver si faltan campos obligatorios
  if (!datos.rol || !datos.nombre_completo || !datos.numero_reloj || !datos.password) {
    console.warn("Faltan campos obligatorios:", datos);
    return; // No enviamos si hay campos vacíos
  }

  // Envío al backend
  this.http.post('http://localhost:3000/usuarios', datos)
    .subscribe({
      next: res => {
        console.log("Respuesta del servidor:", res);
        alert("Usuario registrado correctamente");
      },
      error: err => {
        console.error("Error al registrar:", err);
        alert("Error al registrar el usuario. Revisa la consola para más detalles.");
      }
    });
  console.log(datos);

  this.http.post('http://localhost:3000/usuarios', datos)
    .subscribe(res => {
      console.log("Respuesta servidor:", res);
    }, err => {
      console.error("Error:", err);
    });
}
  }
