// cambiarcontraseña.model.ts
export interface CambiarContrasenaRequest {
  pass: string;
  repass: string;
  token: string; // viene en la URL
}