export interface Usuario {
  idUsuario: string;
  cedula: string;
  nombre: string;
  correo: string;
  clave: string;
  idRol: string; // 👈 relación con Rol
}
