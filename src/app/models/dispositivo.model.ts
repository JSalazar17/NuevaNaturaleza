import { Actuador } from "./actuador.model";
import { Marca } from "./marca.model";
import { Sensor } from "./sensor.model";
import { TipoDispositivo } from "./tipodispositivo.model";
import { EstadoDispositivo } from "./estadoDispositivo.model";
import { Sistema } from "./sistema.model";

export interface Dispositivo {
  idDispositivo?: string;
  nombre: string;
  sn?: string;
  descripcion?: string;
  image?: string;
  idTipoDispositivo?: string;
  idSistema?: string;
  idMarca?: string;
  idEstadoDispositivo?: string;
  tipo?: string;
  valorActual?: string;


  // Relaciones
  sensors?: Sensor[];
  actuadores?: Actuador[];
  idTipoDispositivoNavigation?: TipoDispositivo;
  idMarcaNavigation?: Marca | null;
  idEstadoDispositivoNavigation?: EstadoDispositivo | null; // 🔹 agregado
  idSistemaNavigation?: Sistema | null;
  
}
