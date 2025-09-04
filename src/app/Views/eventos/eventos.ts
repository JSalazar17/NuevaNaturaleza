import { Component, OnInit } from '@angular/core';
import { EventoService } from '../../services/evento.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { Evento } from '../../models/evento.model';
import { Dispositivo } from '../../models/dispositivo.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.html',
  imports: [CommonModule, DatePipe, FormsModule],
  styleUrls: ['./eventos.css']
})
export class Eventos implements OnInit {
  eventos: Evento[] = [];
  dispositivos: Dispositivo[] = [];
  eventoSeleccionado: Evento | null = null;
  dispositivoSeleccionado: Dispositivo | null = null;

  private eventosSubject = new BehaviorSubject<Evento[]>([]);
  eventos$: Observable<Evento[]>=this.eventosSubject.asObservable();

  constructor(
    private eventoService: EventoService,
    private dispositivoService: DispositivoService
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
    this.cargarDispositivos();
  }

  cargarEventos() {
    this.eventoService.getEventos().subscribe(data => {this.eventosSubject.next(data);console.log(data)});
  }

  cargarDispositivos() {
    this.dispositivoService.getDispositivos().subscribe(data => {this.dispositivos = data;console.log(this.dispositivos)});
  }

  seleccionarEvento(evento: Evento) {
    this.eventoSeleccionado = evento;
    this.dispositivoSeleccionado = this.dispositivos.find(d => d.idDispositivo === evento.idDispositivo) || null;
  }

  cerrarDetalle() {
    this.eventoSeleccionado = null;
    this.dispositivoSeleccionado = null;
  }
}
