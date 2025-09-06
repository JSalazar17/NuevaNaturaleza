import { TipoMedicion } from "./tipomedicion.model";
import { UnidadMedida } from "./unidadMedida.model";

export interface TipoMUnidadM{
    idTipoMUnidadM:String,
    idTipoMedicion:string,
    idUnidadMedida:string
    idTipoMedicionNavigation:TipoMedicion
    idUnidadMedidaNavigation:UnidadMedida
}