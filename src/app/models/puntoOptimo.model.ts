import { TipoMUnidadM } from "./tipoMUnidadM.model";

export interface PuntoOptimo {
    idPuntoOptimo?: string,
    idSensor: string,
    idTipoMunidadM: string,
    valorMin: number,
    valorMax: number,
    tipoMUnidadM:TipoMUnidadM
}