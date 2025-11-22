import { Dispositivo } from "./dispositivo.model";

export interface ChecklistDetalle {
  idChecklistDetalle?: string;
  idChecklist?: string;
  idDispositivo?: string;
  nombreDispositivo?:string;
  idDispositivoNavigation?:Dispositivo;
  ultimoValorMedido:string;
  valorRegistrado?: string;   // lo que escribe el usuario para sensores
  estadoActuador?: boolean|string;   // true = encendido, false = apagado (para actuadores)
}

export interface Checklist {
  idChecklist?: string;
  fecha?: Date;
  usuario?: string;
  observacionGeneral?: string;
  detalles: ChecklistDetalle[];
}
