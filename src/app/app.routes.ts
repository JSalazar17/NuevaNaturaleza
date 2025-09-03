import { Routes } from '@angular/router';
import { GestionDispositivos } from './Views/gestion-dispositivos/gestion-dispositivos';
import { RegistrarUsuario } from './Views/registrar-usuario/registrar-usuario';
import { AuditoriaComponent } from './Views/auditoria/auditoria'; 
import { Eventos} from './Views/eventos/eventos'; 
import { LoginController } from './Views/login/login';
import { RecuperarComponent } from './Views/recuperar/recuperar';
import { UsuariosComponent } from './Views/usuarios/usuarios';
import { AgregarDispositivo } from './Views/agregar-dispositivo/agregar-dispositivo';
import { CambiarContrasena } from './Views/cambiar-contraseña/cambiar-contraseña';
import { NotificacionesComponent } from './Views/notificaciones/notificaciones';
import { InicioComponent } from './Views/inicio/inicio';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'gestion-dispositivos', component: GestionDispositivos },
  { path: 'notificaciones', component: NotificacionesComponent },
  { path: 'registrar-usuario', component: RegistrarUsuario},
  { path: 'agregar-dispositivo' , component: AgregarDispositivo},
  { path: 'auditoria', component: AuditoriaComponent }, 
  { path: 'eventos', component: Eventos },     
  { path: 'login', component: LoginController },
  { path: 'inicio', component: InicioComponent },
  { path: 'recuperar', component: RecuperarComponent },
  { path: 'cambiar-contraseña', component: CambiarContrasena},
  { path: 'usuarios', component: UsuariosComponent},
  //{ path: '**', redirectTo: 'login' }
];



