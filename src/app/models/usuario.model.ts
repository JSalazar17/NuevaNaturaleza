import { Rol } from "./rol.model";

export interface Usuario {
  idUsuario: string;
  idRol: string;
  nombre: string; 
  correo: string;
  clave?: string;
  cedula: string;
  codigo?: string;
  idRolNavigation?:Rol;
}
