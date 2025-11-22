import { Accion } from "./accion.model";
import { TipoExceso } from "./tipoExceso.model";

export interface ExcesoPuntoOptimo {
  idExcesoPuntoOptimo: string | null;
  idDispositivo: string;
  idTipoExceso: string;
  idPuntoOptimo:string | null;
  idTipoExcesoNavigation: TipoExceso|null;
  idAccionAct: string;
  idAccionActNavigation: Accion | null;
}