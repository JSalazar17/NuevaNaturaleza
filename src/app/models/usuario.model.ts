export interface Usuario {
  idUsuario?: string;  // Guid
  nombre: string;
  correo: string;
  clave: string;
  cedula: string;
  idRol: string; // Guid de Rol (igual que en backend)
}
