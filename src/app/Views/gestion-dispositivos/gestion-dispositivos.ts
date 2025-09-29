
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DispositivoService } from '../../services/dispositivos.service';
import { Dispositivo } from '../../models/dispositivo.model';
import { TipoDispositivo } from '../../models/tipodispositivo.model';


@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-dispositivos.html',

  styleUrls: ['./gestion-dispositivos.css']
})
export class GestionDispositivos {
  dispositivos: Dispositivo[] = [];
  dispositivosFiltrados: Dispositivo[] = [];
  deviceTypes: TipoDispositivo[] = [];
  terminoBusqueda: string = '';
  tipoSeleccionado: string = 'Todos';

  dispositivoSeleccionado: Dispositivo | null = null;

  constructor(private dispositivoService: DispositivoService) {
    this.cargarDispositivos();
  }

  cargarDispositivos() {
    this.dispositivoService.getDispositivos().subscribe(data => {
      this.dispositivos = data;
      this.dispositivosFiltrados = [...data];
    });
  }

  aplicarFiltros() {
    let filtrados = [...this.dispositivos];

    // filtro por búsqueda
    if (this.terminoBusqueda.trim() !== '') {
      filtrados = filtrados.filter(d =>
        d.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        d.idSistemaNavigation?.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        (d.idEstadoDispositivoNavigation?.nombre?.toLowerCase().includes(this.terminoBusqueda.toLowerCase()))
      );
    }
    // filtro por tipo
    if (this.tipoSeleccionado !== 'Todos') {
      filtrados = filtrados.filter(d =>
        d.idTipoDispositivoNavigation?.nombre === this.tipoSeleccionado
      );
    }

    this.dispositivosFiltrados = filtrados;
  }

  seleccionarDispositivo(dispositivo: Dispositivo) {
    this.dispositivoSeleccionado = dispositivo;
  }

  cerrarDetalle() {
    this.dispositivoSeleccionado = null;
  }


  @ViewChild('chartCanvas0') chartCanvas0!: ElementRef<HTMLCanvasElement>;
  async generarpdfsensor() {

    let dispositivos = [
      {
        nombre: "Dispositivo A",
        sn: "",
        sensors: [
          {
            idTipoMUnidadMNavigation: {
              idTipoMedicionNavigation: { nombre: "Temperatura" },
              idUnidadMedidaNavigation: { nombre: "°C" }
            },
            medicions: [
              { valor: 22.5, fecha: "2025-09-17 08:00" },
              { valor: 23.0, fecha: "2025-09-17 09:00" },
              { valor: 23.8, fecha: "2025-09-17 10:00" }
            ]
          },
          {
            nombre: "Humedad",
            unidad: "%",
            medicions: [
              { valor: 55, fecha: "2025-09-17 08:00" },
              { valor: 57, fecha: "2025-09-17 09:00" },
              { valor: 54, fecha: "2025-09-17 10:00" }
            ]
          }
        ]
      } as Dispositivo,
      {
        nombre: "Dispositivo B",
        sn: "",
        sensors: [
          {
            idTipoMUnidadMNavigation: {
              idTipoMedicionNavigation: { nombre: "Ph" },
              idUnidadMedidaNavigation: { nombre: "Ph" }
            },
            medicions: [
              { valor: 6.8, fecha: "2025-09-17 08:00" },
              { valor: 6.9, fecha: "2025-09-17 09:00" },
              { valor: 7.0, fecha: "2025-09-17 10:00" }
            ]
          }
        ]
      } as Dispositivo
    ];

    const canvas = this.chartCanvas0.nativeElement;
    console.log(this.dispositivos())
    this.pdfSvc.generatePdfDispositivos(this.dispositivos(), this.chartCanvas0)
  }
}
