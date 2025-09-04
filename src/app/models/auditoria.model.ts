export interface Auditoria {
  idAuditoria?: string;
  idUsuario: string;
  idDispositivo: string;
  idAccionAct: string;   // este es el que viene desde el backend
  fecha: string;
  observacion: string;

  // campos adicionales para mostrar nombres en la tabla
  usuarioNombre?: string;
  dispositivoNombre?: string;
  accionNombre?: string;
}

