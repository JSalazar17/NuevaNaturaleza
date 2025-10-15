import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Notificacion } from '../../models/notificacion';
import { NotificacionService } from '../../services/notificacion.service';
import { Titulo } from '../../models/titulo';
import { TituloService } from '../../services/titulo.service';
import { TipoNotificacion } from '../../models/tiponotificacion';
import { TipoNotificacionService } from '../../services/tiponotificacion.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./notificaciones.css']
})
export class NotificacionesComponent implements OnInit {
  
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  notificaciones$: Observable<Notificacion[]> = this.notificacionesSubject.asObservable();
  private cargandoSubject = new BehaviorSubject<boolean>(true);
  cargando$ = this.cargandoSubject.asObservable();

  notificaciones: Notificacion[] = [];
  titulos: Titulo[] = [];
  tiposNotificacion: TipoNotificacion[] = [];

  // 🔹 Paginación
  pageSize: number = 8;
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
    if (isPlatformBrowser(this.platformId)) {
      this.cargarNotificaciones();
    }
  }

  // Devuelve la porción actual
  get paginatedNotificaciones(): Notificacion[] {
    if (!this.notificaciones || this.notificaciones.length === 0) return [];
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.notificaciones.slice(startIndex, startIndex + this.pageSize);
  }

  // trackBy para optimizar renderizado
  trackByNotificacion(index: number, item: Notificacion) {
    return item.idNotificacion;
  }

  cambiarPagina(direccion: number) {
    this.currentPage += direccion;
    if (this.currentPage < 1) this.currentPage = 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    // Forzamos detection para recalcular getter en caso de que haga falta
    this.cd.detectChanges();
  }

  abrirEnlace(notificacion: Notificacion) {
    if (notificacion.enlace) {
      window.open(notificacion.enlace, '_blank');
    }

    // Marcar como leída en frontend si no lo está
    if (!notificacion.leido) {
      notificacion.leido = true;
      // Actualizar en backend
      if (notificacion.idNotificacion) {
        this.notificacionService.updateNotificacion(notificacion.idNotificacion, notificacion).subscribe({
          next: () => { /* ok */ },
          error: (err) => console.error("Error al actualizar notificación", err)
        });
      }
      // actualizar subject para quien lo consuma
      this.notificacionesSubject.next(this.notificaciones);
    }
  }

  eliminarNotificacion(id: string, event: Event) {
    // evitamos que el click se propague y ejecute abrirEnlace
    event.stopPropagation();

    if (!id) return;

    if (!confirm('¿Seguro que deseas eliminar esta notificación?')) return;

    this.notificacionService.deleteNotificacion(id).subscribe({
      next: () => {
        // removemos localmente
        this.notificaciones = this.notificaciones.filter(n => n.idNotificacion !== id);
        // recalculamos páginas
        this.totalPages = Math.max(1, Math.ceil(this.notificaciones.length / this.pageSize));
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        // emitimos nuevo valor
        this.notificacionesSubject.next(this.notificaciones);
        // forzamos detección
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error eliminando notificación', err);
        alert('Ocurrió un error al eliminar la notificación.');
      }
    });
  }

  cargarNotificaciones(): void {
    this.cargandoSubject.next(true);
    this.notificacionService.getNotificaciones().subscribe({
      next: (data: Notificacion[]) => {
        this.notificaciones = data || [];
        this.totalPages = Math.max(1, Math.ceil(this.notificaciones.length / this.pageSize));
        this.currentPage = 1;
        this.notificacionesSubject.next(this.notificaciones);
        this.cargandoSubject.next(false);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando notificaciones', err);
        this.cargandoSubject.next(false);
      }
    });
  }
}
