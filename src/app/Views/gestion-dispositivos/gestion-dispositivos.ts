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
  mostrarModal: boolean = false;

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

    if (this.terminoBusqueda.trim() !== '') {
      filtrados = filtrados.filter(d =>
        d.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        d.idSistemaNavigation?.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        (d.idEstadoDispositivoNavigation?.nombre?.toLowerCase().includes(this.terminoBusqueda.toLowerCase()))
      );
    }

    if (this.tipoSeleccionado !== 'Todos') {
      filtrados = filtrados.filter(d =>
        d.idTipoDispositivoNavigation?.nombre === this.tipoSeleccionado
      );
    }

    this.dispositivosFiltrados = filtrados;
  }

  seleccionarDispositivo(dispositivo: Dispositivo) {
    this.dispositivoSeleccionado = dispositivo;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.dispositivoSeleccionado = null;
  }
}
