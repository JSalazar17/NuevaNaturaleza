import { Accion } from "./accion.model";
import { Dispositivo } from "./dispositivo.model";
import { impacto as Impacto } from "./impacto.model";
import { Sistema } from "./sistema.model";

export interface Evento {
  fecha?: string;
  idEvento: string;        // Guid en .NET → string en TS
  idDispositivo: string;
  idImpacto: string;
  idSistema: string;
  fechaEvento: Date;
  idDispositivoNavigation: Dispositivo;
  idSistemaNavigation: Sistema;
  idImpactoNavigation: Impacto;
  idAccionAct?:string;
  idAccionActNavigation?:Accion;

}
