export interface ChecklistDetalle {
  idChecklistDetalle?: string;
  idChecklist?: string;
  idDispositivo?: string;
  valorRegistrado?: string;   // lo que escribe el usuario para sensores
  estadoActuador?: boolean;   // true = encendido, false = apagado (para actuadores)
}

export interface Checklist {
  idChecklist?: string;
  fecha?: Date;
  usuario?: string;
  observacionGeneral?: string;
  detalles: ChecklistDetalle[];
}
