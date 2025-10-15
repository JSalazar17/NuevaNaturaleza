import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checklist } from '../../models/checklist.model';
import { ChecklistService } from '../../services/checklist.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { Dispositivo } from '../../models/dispositivo.model';

@Component({
  selector: 'app-checklist-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist-form.html',
  styleUrls: ['./checklist-form.css']
})
export class ChecklistFormComponent implements OnInit {
  dispositivos: Dispositivo[] = [];
  checklist: Checklist = {
    fecha: new Date(),
    observacionGeneral: '',
    detalles: []
  };
  mensajeExito = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  constructor(
    private checklistService: ChecklistService,
    private dispositivoService: DispositivoService
  ) {}

  ngOnInit(): void {
    this.cargarDispositivos();
  }

  cargarDispositivos(): void {
    this.dispositivoService.getDispositivos().subscribe(data => {
      this.dispositivos = data.map(d => {
        let valorActual = 'N/A';
        if (d.idTipoDispositivoNavigation?.nombre === 'Sensor' && d.sensors?.length) {
          const mediciones = d.sensors[0].medicions ?? [];
          if (mediciones.length > 0) {
            valorActual = mediciones[mediciones.length - 1].valor.toString();
          }
        }
        if (d.idTipoDispositivoNavigation?.nombre === 'Actuador') {
          valorActual = d.idEstadoDispositivoNavigation?.nombre ?? 'Desconocido';
        }
        return { ...d, valorActual };
      });

      this.checklist.detalles = this.dispositivos.map(d => ({
        idDispositivo: d.idDispositivo,
        valorRegistrado: '',
        estadoActuador: false
      }));
    });
  }

  guardarChecklist(): void {
    this.checklistService.create(this.checklist).subscribe(() => {
      this.mensajeExito = 'Checklist guardado con éxito ✅';
      this.checklist = { fecha: new Date(), observacionGeneral: '', detalles: [] };
      setTimeout(() => (this.mensajeExito = ''), 3000);
      this.cargarDispositivos();
    });
  }

  // 🔹 Exportar reportes a CSV según rango de fechas
  exportarCSV(): void {
    if (!this.fechaDesde || !this.fechaHasta) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }

    this.checklistService.getChecklistsPorFechas(this.fechaDesde, this.fechaHasta).subscribe((data: any[]) => {
      if (data.length === 0) {
        alert('No hay registros en el rango seleccionado.');
        return;
      }

      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `checklist_${this.fechaDesde}_a_${this.fechaHasta}.csv`;
      link.click();
    });
  }

  private convertToCSV(objArray: any[]): string {
    const headers = Object.keys(objArray[0]).join(',');
    const rows = objArray.map(obj => Object.values(obj).join(','));
    return [headers, ...rows].join('\n');
  }
}
