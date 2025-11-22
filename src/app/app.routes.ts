import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./Views/login/login').then((m) => m.LoginController),
  },
  {
    path: 'recuperar',
    loadComponent: () =>
      import('./Views/recuperar/recuperar').then((m) => m.RecuperarComponent),
  },
  {
    path: 'cambiar-contraseña',
    loadComponent: () =>
      import('./Views/cambiar-contraseña/cambiar-contraseña').then(
        (m) => m.CambiarContrasena
      ),
  },
  {
    path: 'testexc',
    loadComponent: () =>
      import('./Views/excesoList/excesoList').then(
        (m) => m.ExcesoListComponent
      ),
  },
  {
    path: 'datapicker',
    loadComponent: () =>
      import('./Views/sensores/dt/dt').then((m) => m.dtComponent),
  },
  {
    path: 'testd',
    loadComponent: () =>
      import('./Views/CambiarEstadoDialog/confirmDialog').then(
        (m) => m.DialogSelectTipoComponent
      ),
  },

  {
    path: '',
    loadComponent: () =>
      import('./Views/layout/layout').then((m) => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'gestion-dispositivos',
        loadComponent: () =>
          import('./Views/gestion-dispositivos/gestion-dispositivos').then(
            (m) => m.GestionDispositivos
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'Iac',
        loadComponent: () =>
          import('./Views/iac/iac').then((m) => m.Iac),
        canActivate: [AuthGuard],
      },
      {
        path: 'programacion-dosificador',
        loadComponent: () =>
          import('./Views/programaciondosificador/programaciondosificador').then(
            (m) => m.ProgramacionDosificadorComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./Views/notificaciones/notificaciones').then(
            (m) => m.NotificacionesComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'registrar-usuario',
        loadComponent: () =>
          import('./Views/registrar-usuario/registrar-usuario').then(
            (m) => m.RegistrarUsuario
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'checklist',
        loadComponent: () =>
          import('./Views/checklist/checklist-form').then(
            (m) => m.ChecklistFormComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'agregar-dispositivo',
        loadComponent: () =>
          import('./Views/agregar-dispositivo/agregar-dispositivo').then(
            (m) => m.AgregarDispositivo
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'sugerencias',
        loadComponent: () =>
          import('./Views/sugerencias/sugerencias').then(
            (m) => m.SugerenciasComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'sensores',
        loadComponent: () =>
          import('./Views/sensores/sensores').then(
            (m) => m.SensoresComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'actuadores',
        loadComponent: () =>
          import('./Views/actuadores/actuadores').then(
            (m) => m.ActuadoresComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('./Views/auditoria/auditoria').then(
            (m) => m.AuditoriaComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./Views/eventos/eventos').then((m) => m.Eventos),
        canActivate: [AuthGuard],
      },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./Views/inicio/inicio').then((m) => m.InicioComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./Views/usuarios/usuarios').then(
            (m) => m.UsuariosComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'dc',
        loadComponent: () =>
          import('./Views/testviewpanel/dashboard').then(
            (m) => m.ParentComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'tpdf',
        loadComponent: () =>
          import('./Views/gestion-dispositivos/filtercomponent/pdfdocument').then(
            (m) => m.PdfComponent
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
];
