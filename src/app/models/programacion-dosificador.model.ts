export interface ProgramacionDosificador {
  idProgramacion?: string;       // Guid generado en .NET
  idDosificador: string;        // Guid del dosificador
  hora: number;
  minuto: number;
  tiempoSegundos: number;
  nombreDosificador?: string;   // opcional, viene desde el DTO
}
