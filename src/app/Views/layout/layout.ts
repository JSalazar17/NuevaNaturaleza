import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // necesario para ngModel
import { NotificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../models/notificacion';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent {
  private notificacionSubject = new BehaviorSubject<Notificacion[]>([]);
  notificacionaes$ = this.notificacionSubject.asObservable();
  isCollapsed = false;
  mostrarPanel = false;
  hayNotificacionNueva = false;

  // roles
  roles = ['Administrador', 'Usuario'];
  rolActual = 'Usuario'; // valor por defecto

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private notifService: NotificacionService
  ) {
    this.cargarNotificaciones();
    this.nuevaNotificacion();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // método llamado por (ngModelChange)
  onRolChange(newRol: string) {
    this.rolActual = newRol;
    console.log('Rol cambiado a:', this.rolActual);
    // forzamos detección por si algo está fuera de NgZone
    this.zone.run(() => {
      this.cdr.detectChanges();
    });
  }

  esAdmin(): boolean {
    return this.rolActual === 'Administrador';
  }

  esUsuario(): boolean {
    return this.rolActual === 'Usuario';
  }

  cargarNotificaciones() {
    this.notifService.getNotificaciones().subscribe(data => {
      this.notificacionSubject.next(data);
    });
  }

  nuevaNotificacion() {
    this.notifService.iniciarConexion();
    this.notifService.hubNotifications().on('RecibirNotificacion', (data) => {
      let notiTemp = this.notificacionSubject.getValue();
      notiTemp.push(data);
      this.notificacionSubject.next([...notiTemp]);
      this.zone.run(() => {
        this.nuevaNotificacion1();
        this.cdr.detectChanges();
      });
    });
  }

  nuevaNotificacion1() {
    this.hayNotificacionNueva = true;
    setTimeout(() => {
      this.hayNotificacionNueva = false;
    }, 1000);
  }
}
