export interface Evento {
  idEvento: string;        // Guid en .NET → string en TS
  idDispositivo: string;
  idImpacto: string;
  idSistema: string;
  fechaEvento: Date;
}
