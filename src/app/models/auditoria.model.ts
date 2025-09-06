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
}

