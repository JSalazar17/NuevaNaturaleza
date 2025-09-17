import { Actuador } from "./actuador.model";
import { Marca } from "./marca.model";
import { Sensor } from "./sensor.model";
import { TipoDispositivo } from "./tipodispositivo.model";

export interface Dispositivo {

  idDispositivo?: string;
  nombre: string;
  sn: string;
  descripcion?: string;
  image?: string;
  idTipoDispositivo?: string;
  idSistema?: string;
  idMarca?: string;
  idEstadoDispositivo?: string;
  sensors?:Sensor[],
  actuadores?:Actuador[]
  idTipoDispositivoNavigation?:TipoDispositivo
  idMarcaNavigation?:Marca|null
}
