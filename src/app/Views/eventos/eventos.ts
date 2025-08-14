// eventos.ts
import { EventosService } from '../../services/eventos.service';
import { Evento } from '../../models/eventos.model';
import { signal, effect, Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [FormsModule,CommonModule],  // <-- IMPORTANTE: Agrega esto
  templateUrl: './eventos.html',
  styleUrl: './eventos.css'
})
export class EventosController {
  listaEventos = signal<Evento[]>([]);
  eventoSeleccionado = signal<Evento | null>(null);

  constructor(private servicio: EventosService) {
    this.cargarEventos();
  }

  cargarEventos() {
    this.servicio.obtenerEventos().subscribe({
      next: data => this.listaEventos.set(data),
      error: err => console.error('Error al cargar eventos:', err)
    });
  }

  seleccionarEvento(evento: Evento) {
    this.eventoSeleccionado.set(evento);
  }

  agregarEvento(nuevo: Evento) {
    this.servicio.agregarEvento(nuevo).subscribe({
      next: e => {
        this.listaEventos.update(lista => [...lista, e]);
        this.eventoSeleccionado.set(null);
      },
      error: err => console.error('Error al agregar evento:', err)
    });
  }

  modificarEvento(actualizado: Evento) {
    if (!actualizado.IdEvento) return;

    this.servicio.modificarEvento(actualizado.IdEvento, actualizado).subscribe({
      next: e => {
        this.listaEventos.update(lista =>
          lista.map(ev => ev.IdEvento === e.idEvento ? e : ev)
        );
        this.eventoSeleccionado.set(null);
      },
      error: err => console.error('Error al modificar evento:', err)
    });
  }

  eliminarEvento(id: string) {
    this.servicio.eliminarEvento(id).subscribe({
      next: () => {
        this.listaEventos.update(lista =>
          lista.filter(ev => ev.IdEvento !== id)
        );
        this.eventoSeleccionado.set(null);
      },
      error: err => console.error('Error al eliminar evento:', err)
    });
  }
}
