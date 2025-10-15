import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgramacionDosificadorService } from '../../services/programacion-dosificador.service';
import { ProgramacionDosificador } from '../../models/programacion-dosificador.model';
import { DosificadorService } from '../../services/dosificador.service';
import { Dosificador } from '../../models/dosificador.model';
import { DispositivoService } from '../../services/dispositivos.service';
import { Dispositivo } from '../../models/dispositivo.model';

@Component({
  selector: 'app-programacion-dosificador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programaciondosificador.html',
  styleUrls: ['./programaciondosificador.css']
})
export class ProgramacionDosificadorComponent implements OnInit {
  programaciones: ProgramacionDosificador[] = [];
  dosificadores: Dosificador[] = [];
  dispositivosActuadores: Dispositivo[] = [];

  programacion: ProgramacionDosificador = {
    idProgramacion: undefined,
    idDosificador: '',
    hora: 0,
    minuto: 0,
    tiempoSegundos: 1
  };

  nuevoDosificador: Dosificador = {
    idDispositivo: '',
    letraActivacion: '',
    descripcion: '',
    nombre: undefined
  };

  mostrarFormularioDosificador = false;
  modoEdicion = false;

  constructor(
    private programService: ProgramacionDosificadorService,
    private dosificadorService: DosificadorService,
    private dispositivoService: DispositivoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerProgramaciones();
    this.obtenerDosificadores();
    this.obtenerActuadores();
  }

  obtenerProgramaciones() {
    this.programService.getAll().subscribe({
      next: (res) => {
        this.programaciones = res ?? [];
        this.cdr.detectChanges(); // 🔥 Fuerza actualización visual
      },
      error: (err) => {
        console.error('Error al obtener programaciones', err);
        this.programaciones = [];
        this.cdr.detectChanges();
      }
    });
  }

  obtenerActuadores() {
    this.dispositivoService.getDispositivos().subscribe({
      next: (res) => {
        this.dispositivosActuadores = res.filter(
          (d) => d.idTipoDispositivoNavigation?.nombre?.toLowerCase() === 'actuador'
        );
        this.cdr.detectChanges(); // 🔥 Actualiza vista
      },
      error: (err) => {
        console.error('Error al obtener dispositivos', err);
        this.dispositivosActuadores = [];
        this.cdr.detectChanges();
      }
    });
  }

  obtenerDosificadores() {
    this.dosificadorService.getAll().subscribe({
      next: (res) => {
        this.dosificadores = res ?? [];
        this.cdr.detectChanges(); // 🔥 Refresca tabla inmediatamente
      },
      error: (err) => {
        console.error('Error al obtener dosificadores', err);
        this.dosificadores = [];
        this.cdr.detectChanges();
      }
    });
  }

  guardarDosificador() {
    if (!this.nuevoDosificador.idDispositivo || !this.nuevoDosificador.letraActivacion) {
      alert('Debe ingresar todos los campos del dosificador.');
      return;
    }
    this.dosificadorService.create(this.nuevoDosificador).subscribe({
      next: () => {
        alert('Dosificador agregado correctamente.');
        this.obtenerDosificadores();
        this.cancelarDosificador();
      },
      error: (err) => {
        console.error('Error al agregar dosificador', err);
        alert('Error al guardar el dosificador.');
      }
    });
  }

  cancelarDosificador() {
    this.nuevoDosificador = { idDispositivo: '', letraActivacion: '', descripcion: '', nombre: '' };
    this.mostrarFormularioDosificador = false;
  }

  guardar() {
    if (!this.programacion.idDosificador) {
      alert('Seleccione un dosificador.');
      return;
    }

    console.log('📦 Datos enviados al backend:', this.programacion);

    const operacion = this.modoEdicion
      ? this.programService.update(this.programacion.idProgramacion as string, this.programacion)
      : this.programService.create(this.programacion);

    operacion.subscribe({
      next: () => {
        this.obtenerProgramaciones();
        this.cancelar();
        this.cdr.detectChanges(); // 🔥 Refresca después de guardar
      },
      error: (err) => {
        console.error('Error al guardar/actualizar programación', err);
        alert('Error al procesar la programación.');
      }
    });
  }

  editar(p: ProgramacionDosificador) {
    this.programacion = { ...p };
    this.modoEdicion = true;
    this.cdr.detectChanges();
  }

  eliminar(id?: string) {
    if (!id) return;
    if (!confirm('¿Deseas eliminar este horario?')) return;
    this.programService.delete(id).subscribe({
      next: () => {
        this.obtenerProgramaciones();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error eliminando', err);
        alert('Error al eliminar la programación.');
      }
    });
  }

  cancelar() {
    this.programacion = { idProgramacion: undefined, idDosificador: '', hora: 0, minuto: 0, tiempoSegundos: 1 };
    this.modoEdicion = false;
    this.cdr.detectChanges();
  }
}
