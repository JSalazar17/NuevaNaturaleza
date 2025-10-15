import { ProgramacionDosificador } from './programacion-dosificador.model';

export interface Dosificador {
nombre: any;
  idDosificador?: string;
  idDispositivo: string;
  letraActivacion?: string;
  descripcion?: string;
  idDispositivoNavigation?: { idDispositivo?: string; nombre?: string }; // opcional
  programaciones?: ProgramacionDosificador[];
}
