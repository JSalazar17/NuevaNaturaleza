import { Accion } from "./accion.model";
import { Dispositivo } from "./dispositivo.model";
import { Usuario } from "./usuario.model";

export interface Auditoria {
  idAuditoria?: string;
  idUsuario: string;
  idDispositivo: string;
  idAccion: string;
  fecha: string; 
  observacion: string;
  usuarioNombre?: string;
  dispositivoNombre?: string;
  accionNombre?: string;
  idDispositivoNavigation?:Dispositivo,
  idUsuarioNavigation?:Usuario,
  IdAccionNavigation:Accion,
}

