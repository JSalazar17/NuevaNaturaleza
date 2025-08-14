import { Routes } from '@angular/router';
import { GestionDispositivos } from './Views/gestion-dispositivos/gestion-dispositivos';
import { Auditoria } from './Views/auditoria/auditoria';
import { EventosController } from './Views/eventos/eventos';
import { LoginController } from './Views/login/login';
import { Recuperar } from './Views/recuperar/recuperar';
import { UsuariosComponent } from './Views/usuarios/usuarios';
import { AgregarDispositivo } from './Views/agregar-dispositivo/agregar-dispositivo';

export const routes: Routes = [
  { path: 'gestion-dispositivos', component: GestionDispositivos },
  { path: 'agregar-dispositivo' , component: AgregarDispositivo},
  { path: 'auditoria', component: Auditoria },
  { path: 'eventos', component: EventosController },
  { path: 'login', component: LoginController },
  { path: 'recuperar', component: Recuperar },
  { path: 'usuarios', component: UsuariosComponent}
];
