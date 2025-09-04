import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, {
  ...appConfig, // <-- conserva lo que ya tenías (router, http, etc.)
  providers: [
    ...(appConfig.providers ?? []), // <-- mergea providers previos
    provideCharts(withDefaultRegisterables()) // <-- agrega Chart.js
  ]
})
.catch((err) => console.error(err));
