import { TipoNotificacion } from './tiponotificacion';
import { Titulo } from './titulo';

export interface Notificacion {
  idNotificacion: string;
  idTitulo: string;
  idTipoNotificacion: string;
  mensaje?: string;
  enlace?: string;
  leido?: boolean;
  idTipoNotificacionNavigation?: TipoNotificacion;
  idTituloNavigation?: Titulo;
}
