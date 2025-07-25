import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css'
})
export class Eventos {
  eventos = [
    { id: 1, dispositivo: 'Sensor de pH', impacto: 'Alto', sistema: 'Control de Agua', fecha: '2025-07-18' },
    { id: 2, dispositivo: 'Bomba', impacto: 'Medio', sistema: 'Circulación', fecha: '2025-07-17' }
  ];

  eventoSeleccionado: any = null;

  mostrarModal = false;
  modoModal: 'agregar' | 'editar' = 'agregar';
  formulario: any = { dispositivo: '', impacto: '', sistema: '', fecha: '' };

  seleccionar(evento: any) {
    this.eventoSeleccionado = evento;
  }

  abrirModal(modo: 'agregar' | 'editar') {
    this.modoModal = modo;
    this.mostrarModal = true;
    if (modo === 'editar' && this.eventoSeleccionado) {
      this.formulario = { ...this.eventoSeleccionado };
    } else {
      this.formulario = { dispositivo: '', impacto: '', sistema: '', fecha: '' };
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardar() {
    if (this.modoModal === 'agregar') {
      const nuevo = { ...this.formulario, id: this.eventos.length + 1 };
      this.eventos.push(nuevo);
    } else if (this.modoModal === 'editar' && this.eventoSeleccionado) {
      Object.assign(this.eventoSeleccionado, this.formulario);
    }
    this.cerrarModal();
  }

  eliminar() {
    const confirmar = confirm('¿Seguro que quieres eliminar este evento?');
    if (confirmar) {
      this.eventos = this.eventos.filter(e => e !== this.eventoSeleccionado);
      this.eventoSeleccionado = null;
    }
  }
}
