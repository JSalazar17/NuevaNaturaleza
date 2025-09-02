export interface Actuador {
  idActuador: string;       // Guid → string
  idDispositivo: string;    // Guid → string
  idAccionAct: string;      // Guid → string
  on?: string;
  off?: string;
}
