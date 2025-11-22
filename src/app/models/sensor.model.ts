import { DatosEstadisticos } from "./datosEstadistico.model";
import { Medicion } from "./medicion.model";
import { PuntoOptimo } from "./puntoOptimo.model";
import { TipoMUnidadM } from "./tipoMUnidadM.model";

export interface Sensor{
mostrarInfo: any;
    idSensor?:string,
    idDispositivo?:string,
    idTipoMUnidadM?:string;
    idTipoMUnidadMNavigation?:TipoMUnidadM,
    medicions:Medicion[],
    puntoOptimos:PuntoOptimo[],
    datosEstadisticos:DatosEstadisticos;
}