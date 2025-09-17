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
    this.cargarNotificaciones();
  }

  abrirEnlace(notificacion: Notificacion) {
    if (notificacion.enlace) {
      window.open(notificacion.enlace, '_blank');
    }

    // Marcar como leída en el frontend
    notificacion.leido = true;

    // Si quieres guardar en backend
    this.notificacionService.updateNotificacion(notificacion.idNotificacion as string,notificacion).subscribe({
      next: () => console.log("Notificación marcada como leída"),
      error: (err) => console.error("Error al actualizar notificación", err)
    });
  }




  cargando: boolean = true;


  cargarNotificaciones(): void {
    this.cargandoSubject.next(true); // activa loading
    this.notificacionService.getNotificaciones().subscribe({
      next: (data: Notificacion[]) => {
        this.notificacionesSubject.next(data); // ✅ actualiza observable
        this.cargandoSubject.next(false); // ✅ desactiva loading
      },
      error: (err) => {
        console.error('Error cargando notificaciones', err);
        this.cargandoSubject.next(false); // incluso si falla
      }
    });
  }
}
  

