import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css'
})
export class Auditoria {
  auditorias = [
    { id: 1, usuario: 'Juan', dispositivo: 'Sensor de pH', accion: 'Actualizó', fecha: '2025-07-18', observacion: 'Cambio de calibración' },
    { id: 2, usuario: 'María', dispositivo: 'Bomba', accion: 'Eliminó', fecha: '2025-07-17', observacion: 'Desinstalación' }
  ];

  auditoriaSeleccionada: any = null;

  mostrarModal = false;
  modoModal: 'agregar' | 'editar' = 'agregar';
  formulario: any = { usuario: '', dispositivo: '', accion: '', fecha: '', observacion: '' };

  seleccionar(auditoria: any) {
    this.auditoriaSeleccionada = auditoria;
  }

  abrirModal(modo: 'agregar' | 'editar') {
    this.modoModal = modo;
    this.mostrarModal = true;
    if (modo === 'editar' && this.auditoriaSeleccionada) {
      this.formulario = { ...this.auditoriaSeleccionada };
    } else {
      this.formulario = { usuario: '', dispositivo: '', accion: '', fecha: '', observacion: '' };
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardar() {
    if (this.modoModal === 'agregar') {
      const nuevo = { ...this.formulario, id: this.auditorias.length + 1 };
      this.auditorias.push(nuevo);
    } else if (this.modoModal === 'editar' && this.auditoriaSeleccionada) {
      Object.assign(this.auditoriaSeleccionada, this.formulario);
    }
    this.cerrarModal();
  }

  eliminar() {
    const confirmar = confirm('¿Seguro que quieres eliminar este registro?');
    if (confirmar) {
      this.auditorias = this.auditorias.filter(a => a !== this.auditoriaSeleccionada);
      this.auditoriaSeleccionada = null;
    }
  }
}
