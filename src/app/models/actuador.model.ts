import { Accion } from "./accion.model";

export interface Actuador {
  idAccionActNavigation?: Accion;
  idActuador?: string;       // Guid → string
  idDispositivo?: string;    // Guid → string
  idAccionAct: string;      // Guid → string
  on?: string;
  off?: string;
}
