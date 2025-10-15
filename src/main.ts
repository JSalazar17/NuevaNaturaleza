import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
bootstrapApplication(App, {
  ...appConfig, // <-- conserva lo que ya tenías (router, http, etc.)
  providers: [
    ...(appConfig.providers ?? []), // <-- mergea providers previos
    provideCharts(withDefaultRegisterables()), // <-- agrega Chart.js
    provideAnimations(),
    provideNativeDateAdapter()
  ]
})
.catch((err) => console.error(err));
