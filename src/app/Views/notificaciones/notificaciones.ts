import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Notificacion } from '../../models/notificacion';
import { NotificacionService } from '../../services/notificacion.service';
import { Titulo } from '../../models/titulo';
import { TituloService } from '../../services/titulo.service';
import { TipoNotificacion } from '../../models/tiponotificacion';
import { TipoNotificacionService } from '../../services/tiponotificacion.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  // 🔹 Paginación
  pageSize: number = 8; // cantidad por página
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private notificacionService: NotificacionService,
    private tituloService: TituloService,
    private tipoNotificacionService: TipoNotificacionService,
    private cd: ChangeDetectorRef
    
  ) {}
  ngOnInit(): void {
    // Cargar primero títulos y tipos
    
  if (isPlatformBrowser(this.platformId)) {
    this.cargarNotificaciones();
  }}

  get paginatedNotificaciones(): Notificacion[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.notificaciones.slice(startIndex, startIndex + this.pageSize);
  }

  cambiarPagina(direccion: number) {
    this.currentPage += direccion;
    if (this.currentPage < 1) this.currentPage = 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
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
        this.notificaciones = data;
        this.totalPages = Math.ceil(this.notificaciones.length / this.pageSize);
        this.currentPage = 1; // reinicia a la primera página
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
  

