import { Sensor } from "./sensor.model";

export interface Dispositivo {

  idDispositivo?: string;
  nombre: string;
  sn: string;
  descripcion?: string;
  image?: string;
  idTipoDispositivo?: string;
  idSistema?: string;
  idMarca?: string;
  idTipoMedicion?: string;
  idEstadoDispositivo?: string;
  Sensors?:Sensor[]
}
