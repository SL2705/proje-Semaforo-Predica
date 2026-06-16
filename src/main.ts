import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { LOCALE_ID } from '@angular/core';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

//  Registrar idioma español
registerLocaleData(localeEs);

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(),

    //  locale global español
    { provide: LOCALE_ID, useValue: 'es' }
  ]
}).catch(err => console.error(err));
