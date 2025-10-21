import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class GestionDispositivos implements OnInit, OnDestroy {
  dispositivos: Dispositivo[] = [];
  dispositivosFiltrados: Dispositivo[] = [];
  deviceTypes: TipoDispositivo[] = [];
  terminoBusqueda: string = '';
  tipoSeleccionado: string = 'Todos';
  dispositivoSeleccionado: Dispositivo | null = null;
  mostrarModal: boolean = false;
  private intervaloActualizacion: any;
  cargando: boolean = false;

  constructor(
    private dispositivoService: DispositivoService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDispositivos();

    // 🔄 Refresca automáticamente cada 10 segundos
    this.intervaloActualizacion = setInterval(() => {
      this.cargarDispositivos();
    }, 10000);
  }

  ngOnDestroy(): void {
    // ✅ Limpia el intervalo al salir de la vista
    if (this.intervaloActualizacion) {
      clearInterval(this.intervaloActualizacion);
    }
  }

  cargarDispositivos() {
    this.cargando = true;
    this.dispositivoService.getDispositivos().subscribe({
      next: (data) => {
        this.dispositivos = data ?? [];
        this.dispositivosFiltrados = [...this.dispositivos];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar dispositivos:', err);
        this.cargando = false;
      }
    });
  }

  irAHorarios() {
    this.router.navigate(['/programacion-dosificador']);
  }

  aplicarFiltros() {
    let filtrados = [...this.dispositivos];

    if (this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(d =>
        d.nombre.toLowerCase().includes(termino) ||
        d.idSistemaNavigation?.nombre.toLowerCase().includes(termino) ||
        d.idEstadoDispositivoNavigation?.nombre?.toLowerCase().includes(termino)
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
      data: { dispositivo: null }
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
          .subscribe({
            next: () => this.cargarDispositivos(),
            error: (err) => console.error('Error al eliminar dispositivo:', err)
          });
      }
    });
  }
}
