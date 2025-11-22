import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { EventoService } from '../../services/evento.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { Evento } from '../../models/evento.model';
import { Dispositivo } from '../../models/dispositivo.model';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, catchError, delay, Observable, of, retryWhen, scan } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PdfSensor } from '../../models/pdfsensor.model';
import { pdfService } from '../../services/pdf.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { Console } from 'console';
import { ToggleService } from '../../services/toggle.service';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.html',
  imports: [CommonModule, DatePipe, FormsModule,
    MatButtonModule,MatMenuModule,
  MatFormFieldModule, ReactiveFormsModule,
MatIconModule,
  MatDatepickerModule,MatSelectModule,
    MatInputModule,
    MatNativeDateModule,
    NgxPaginationModule
  ],
  styleUrls: ['./eventos.css']
})
export class Eventos implements OnInit {
  eventos= signal<Evento[]>([]);
  eventosFiltrados=signal<Evento[]>([])
  dispositivos: Dispositivo[] = [];
  eventoSeleccionado: Evento | null = null;
  dispositivoSeleccionado: Dispositivo | null = null;
  terminoBusqueda: string = "";
  dispositivoSeleccionadoFiltro: string = "Todos";
  paginaActual: number = 1;

  private eventosSubject = new BehaviorSubject<Evento[]>([]);
  eventos$: Observable<Evento[]>=this.eventosSubject.asObservable();

  
  rango = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private pdfSvc: pdfService,
    private eventoService: EventoService,
    private dispositivoService: DispositivoService,
    private toggleSvc:ToggleService
  ) {}

  ngOnInit(): void {
    
  if (isPlatformBrowser(this.platformId)) {
    this.cargarEventos();}
    //this.cargarDispositivos();
  }

  cargarEventos() {
    this.eventoService.getEventos().subscribe(data => {
      
      this.eventos.set(data.map(x=>{
        x.fecha = (new Date(x.fechaEvento).toLocaleDateString() +" "+ new Date(x.fechaEvento).toLocaleTimeString() );
        return x;
      }));
      console.log(data)
      this.eventosFiltrados.set([...this.eventos()]); // inicial
    });
  }

  cargarDispositivos() {
    this.dispositivoService.getDispositivos().subscribe(data => {
      this.dispositivos = data;
    });
  }

  aplicarFiltros() {
    this.eventosFiltrados.set(this.eventos().filter(e => {
      const busqueda = this.terminoBusqueda.toLowerCase();

      const cumpleBusqueda =
        e.idDispositivoNavigation.nombre.toLowerCase().includes(busqueda) ||
        e.idImpactoNavigation.nombre.toLowerCase().includes(busqueda) ||
        e.idSistemaNavigation.nombre.toLowerCase().includes(busqueda) ||
        (e.fechaEvento ? new Date(e.fechaEvento).toLocaleDateString().indexOf(busqueda)!=-1 : false);

      const cumpleDispositivo =
        this.dispositivoSeleccionadoFiltro === "Todos" ||
        e.idDispositivoNavigation.idTipoDispositivo === this.dispositivoSeleccionadoFiltro;

      return cumpleBusqueda && cumpleDispositivo;
    }));
  }

  seleccionarEvento(evento: Evento) {
    this.eventoSeleccionado = evento;
    this.dispositivoSeleccionado = evento.idDispositivoNavigation || null;
    console.log( this.dispositivoSeleccionado)
  }

  cerrarDetalle() {
    this.eventoSeleccionado = null;
    this.dispositivoSeleccionado = null;
  }
    isPlatformBrowser() {

  return isPlatformBrowser(this.platformId)
}
  async generarpdfEventos() {
    if(this.rango.value.start == null ||
    this.rango.value.end == null)
    {
      this.toggleSvc.show('Seleccione fecha inicial y final', 'warning')
      return;}
      this.toggleSvc.show('Generando PDF.', 'loading')
    let psens:PdfSensor = {desde:(this.rango.value.start),hasta:this.rango.value.end}
    await this.pdfSvc.PdfEventos(psens)
  }
}
