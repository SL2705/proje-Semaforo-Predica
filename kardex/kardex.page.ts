import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.page.html',
  styleUrls: ['./kardex.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, CommonModule]
})
export class KardexPage implements OnInit {

  kardexData: any = null;
  numero: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {

    this.numero = this.route.snapshot.paramMap.get('numero') || '';

    if (!this.numero) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<any>(
      `http://192.168.1.13:3000/kardex-data/${this.numero}`
    ).subscribe(data => {
      this.kardexData = data;
    });
  }

  volver() {
    this.router.navigate(['/operador']);
  }

  descargarKardex() {

    this.http.get(
      `http://192.168.1.13:3000/kardex/${this.numero}`,
      { responseType: 'blob' }
    ).subscribe((data: Blob) => {

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      window.open(url, '_blank');
    });
  }
}