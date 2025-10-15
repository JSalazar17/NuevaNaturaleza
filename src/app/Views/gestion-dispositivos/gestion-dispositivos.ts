import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DispositivoService } from '../../services/dispositivos.service';
import { Dispositivo } from '../../models/dispositivo.model';
import { TipoDispositivo } from '../../models/tipodispositivo.model';
import { MatDialog } from '@angular/material/dialog';
import { AgregarDispositivo } from '../agregar-dispositivo/agregar-dispositivo';
import { ConfirmDialogComponent } from '../ConfirmDialog/confirmDialog';
import { Router } from '@angular/router';


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

  constructor(
    private dispositivoService: DispositivoService,
    private dialog: MatDialog,
    private router: Router) 
    {
    this.cargarDispositivos();
  }

  cargarDispositivos() {
    this.dispositivoService.getDispositivos().subscribe(data => {
      this.dispositivos = data;
      this.dispositivosFiltrados = [...data];
    });
  }

  irAHorarios() {
  this.router.navigate(['/programacion-dosificador']); // 👈 Usa la ruta que definiste para la vista
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


  agregarDispositivo() {
  const dialogRef = this.dialog.open(AgregarDispositivo, {
    width: '800px',
    data: { dispositivo: null } // 👈 Se pasa vacío para crear nuevo
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) this.cargarDispositivos();
  });
}

  editarDispositivo(dispositivo: Dispositivo) {
  const dialogRef = this.dialog.open(AgregarDispositivo, {
    width: '800px',
    data: { dispositivo }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) this.cargarDispositivos();
  });
}

eliminarDispositivo(d: Dispositivo) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '800px',
    data: { message: 'Se borrará este dispositivo y sus datos relacionados' }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.dispositivoService.deleteDispositivo(d.idDispositivo as string)
        .subscribe(() => this.cargarDispositivos());
    }
  });
}
}

