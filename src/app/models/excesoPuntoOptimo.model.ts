import { Accion } from "./accion.model";
import { TipoExceso } from "./tipoExceso.model";

export interface ExcesoPuntoOptimo {
  idExcesoPuntoOptimo: string;
  idDispositivo: string;
  idTipoExceso: string;
  idPuntoOptimo:string;
  idTipoExcesoNavigation: TipoExceso;
  idAccionAct: string;
  idAccionActNavigation: Accion;
}