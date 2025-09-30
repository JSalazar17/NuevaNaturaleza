import { Routes } from '@angular/router';
import { LayoutComponent } from './Views/layout/layout';
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
import { Testchart } from './Views/testchart/testchart';
import { ParentComponent } from './Views/testviewpanel/dashboard';
import { PdfComponent } from './Views/gestion-dispositivos/filtercomponent/pdfdocument';
import { SensoresComponent} from './Views/sensores/sensores';
import { ActuadoresComponent} from './Views/actuadores/actuadores';
import { SugerenciasComponent } from './Views/sugerencias/sugerencias';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'registrar-usuario', component: RegistrarUsuario},
  { path: 'login', component: LoginController },
  { path: 'recuperar', component: RecuperarComponent },
  { path: 'cambiar-contraseña', component: CambiarContrasena},
  { path: 'testchart', component: Testchart},
  {
    path: '',
    component: LayoutComponent,
    children:[
      { path: 'gestion-dispositivos', component: GestionDispositivos },
      { path: 'notificaciones', component: NotificacionesComponent },
      { path: 'registrar-usuario', component: RegistrarUsuario},
      { path: 'agregar-dispositivo' , component: AgregarDispositivo},
      { path: 'sugerencias', component: SugerenciasComponent},
      { path: 'sensores', component: SensoresComponent},
      { path: 'actuadores', component: ActuadoresComponent},
      { path: 'auditoria', component: AuditoriaComponent }, 
      { path: 'eventos', component: Eventos },     
      { path: 'inicio', component: InicioComponent },
      { path: 'usuarios', component: UsuariosComponent},
      { path: 'dc', component: ParentComponent},
      { path: 'tpdf', component: PdfComponent},
    ]
  }
];



