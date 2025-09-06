import { Medicion } from "./medicion.model";
import { PuntoOptimo } from "./puntoOptimo.model";
import { TipoMUnidadM } from "./tipoMUnidadM.model";

export interface Sensor{
    idSensor?:String,
    idDispositivo:string,
    idTipoMUnidadM:string;
    tipoMUnidadM:TipoMUnidadM,
    medicions:Medicion[]
    puntoOptimos:PuntoOptimo[]
}