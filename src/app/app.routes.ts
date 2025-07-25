import { Routes } from '@angular/router';
import { GestionDispositivos } from './Views/gestion-dispositivos/gestion-dispositivos';
import { Auditoria } from './Views/auditoria/auditoria';
import { Eventos } from './Views/eventos/eventos';
import { Login } from './Views/login/login';
import { Recuperar } from './Views/recuperar/recuperar';
import { Usuarios } from './Views/usuarios/usuarios';

export const routes: Routes = [
  { path: 'gestion-dispositivos', component: GestionDispositivos },
  { path: 'auditoria', component: Auditoria },
  { path: 'eventos', component: Eventos },
  { path: 'login', component: Login },
  { path: 'recuperar', component: Recuperar },
  { path: 'usuarios', component: Usuarios}
];
