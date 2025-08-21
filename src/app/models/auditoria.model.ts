export interface Auditoria {
  dispositivoNombre: any;
  usuarioNombre: any;
  idAuditoria?: string;
  idUsuario: string;
  idDispositivo: string;
  accion: string;
  fecha: string; // lo manejamos como string para binding
  observacion: string;
}
