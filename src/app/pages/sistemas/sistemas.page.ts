import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-sistemas',
  templateUrl: './sistemas.page.html',
  styleUrls: ['./sistemas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent
  ]
})
export class SistemasPage implements OnInit {

  usuarios: any[] = [];
  usuarioEditando: any = null;

  // ⚠️ USA SOLO UNA IP (la correcta de tu servidor)
  private API_URL = 'http://localhost:3001';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.verificarSesion();
  }

  ionViewWillEnter() {
    this.cargarUsuarios();
  }

  // 🔐 Verifica sesión
  verificarSesion() {
    const data = localStorage.getItem('usuario');

    if (!data) {
      this.router.navigate(['/login']);
      return;
    }

    const usuario = JSON.parse(data);

    if (usuario.rol !== 'sistemas') {
      alert('Acceso no autorizado');
      this.router.navigate(['/login']);
    }
  }

  // 📥 Cargar usuarios
  cargarUsuarios() {
    this.http.get<any[]>(`${this.API_URL}/usuarios`)
      .subscribe({
        next: (data) => {
          console.log("Usuarios recibidos:", data);
          this.usuarios = data;
        },
        error: (err) => {
          console.error("Error cargando usuarios:", err);
          alert('Error cargando usuarios');
        }
      });
  }

  // ✏️ Editar
  editar(usuario: any) {
    this.usuarioEditando = { ...usuario };
  }

guardarCambios() {

  if (!this.usuarioEditando?.id) return;

  console.log("Enviando datos:", this.usuarioEditando);

  this.http.put(
    `${this.API_URL}/usuarios/${this.usuarioEditando.id}`,
    {
      nombre_completo: this.usuarioEditando.nombre_completo,
      rol: this.usuarioEditando.rol
    }
  ).subscribe({
    next: (res) => {
      console.log("Respuesta servidor:", res);
      this.usuarioEditando = null;
      this.cargarUsuarios();
    },
    error: (err) => {
      console.error("Error actualizando:", err);
    }
  });
}

  // ❌ Eliminar
  eliminar(id: number) {

    const confirmacion = confirm('¿Seguro que desea eliminar este usuario?');
    if (!confirmacion) return;

    this.http.delete(`${this.API_URL}/usuarios/${id}`)
      .subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.id !== id);
        },
        error: (err) => {
          console.error("Error eliminando:", err);
          alert('Error eliminando usuario');
        }
      });
  }

  // 🔙 Cerrar sesión
  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}