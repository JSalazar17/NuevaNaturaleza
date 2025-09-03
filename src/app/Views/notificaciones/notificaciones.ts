import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Notificacion } from '../../models/notificacion';
import { NotificacionService } from '../../services/notificacion.service';
import { Titulo } from '../../models/titulo';
import { TituloService } from '../../services/titulo.service';
import { TipoNotificacion } from '../../models/tiponotificacion';
import { TipoNotificacionService } from '../../services/tiponotificacion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./notificaciones.css']
})
export class NotificacionesComponent implements OnInit {
  
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  notificaciones$: Observable<Notificacion[]>=this.notificacionesSubject.asObservable();


  private cargandoSubject = new BehaviorSubject<boolean>(true);
  cargando$ = this.cargandoSubject.asObservable();






  notificaciones: Notificacion[] = [];
  titulos: Titulo[] = [];
  tiposNotificacion: TipoNotificacion[] = [];
  http: any;

  constructor(
    private notificacionService: NotificacionService,
    private tituloService: TituloService,
    private tipoNotificacionService: TipoNotificacionService,
    private cd: ChangeDetectorRef
    
  ) {}
  ngOnInit(): void {
    // Cargar primero títulos y tipos
    this.cargarTitulos();
    this.cargarTipos();
    this.cargarNotificaciones1();
    //this.cargarTodo();
  }

  cargarTitulos(): void {
    this.tituloService.getTitulos().subscribe({
      next: (data) => this.titulos = data,
      error: (err) => console.error('Error cargando títulos', err)
    });
  }

  cargarTipos(): void {
    this.tipoNotificacionService.getTipos().subscribe({
      next: (data) => this.tiposNotificacion = data,
      error: (err) => console.error('Error cargando tipos', err)
    });
  }
  cargando: boolean = true;

  cargarTodo(): void {
  forkJoin({
    titulos: this.tituloService.getTitulos(),
    tipos: this.tipoNotificacionService.getTipos(),
    notificaciones: this.notificacionService.getNotificaciones()
  }).subscribe({
    next: ({ titulos, tipos, notificaciones }) => {
      this.titulos = titulos;
      this.tiposNotificacion = tipos;
      this.notificaciones = notificaciones.map(n => ({
        ...n,
        idTituloNavigation: titulos.find(t => t.idTitulo === n.idTitulo),
        idTipoNotificacionNavigation: tipos.find(t => t.idTipoNotificacion === n.idTipoNotificacion)
      }));
      console.log('Datos cargados:', this.notificaciones);
    },
    error: (err) => console.error('Error cargando datos', err)
  });
}
  cargarNotificaciones1(): void {
    this.cargandoSubject.next(true); // activa loading
    this.notificacionService.getNotificaciones().subscribe({
      next: (data: Notificacion[]) => {
        const notificaciones = data.map(n => ({
          ...n,
          idTituloNavigation: this.titulos.find(t => t.idTitulo === n.idTitulo),
          idTipoNotificacionNavigation: this.tiposNotificacion.find(
            t => t.idTipoNotificacion === n.idTipoNotificacion
          )
        }));
        this.notificacionesSubject.next(notificaciones); // ✅ actualiza observable
        this.cargandoSubject.next(false); // ✅ desactiva loading
      },
      error: (err) => {
        console.error('Error cargando notificaciones', err);
        this.cargandoSubject.next(false); // incluso si falla
      }
    });
  }
  cargarNotificaciones(): void {
    this.notificacionService.getNotificaciones().subscribe({
      next: (data: Notificacion[]) => {
        this.notificaciones = data.map(n => ({
          ...n,
          idTituloNavigation: this.titulos.find(t => t.idTitulo === n.idTitulo),
          idTipoNotificacionNavigation: this.tiposNotificacion.find(t => t.idTipoNotificacion === n.idTipoNotificacion)
        }));
        this.cargando = false; // 👉 se desactiva cuando termina
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando notificaciones', err);
        this.cargando = false; // 👉 igual se desactiva aunque falle
      }
    });
  }
}
