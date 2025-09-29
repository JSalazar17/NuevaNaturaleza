import { ChangeDetectorRef, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

import { CommonModule, isPlatformBrowser } from '@angular/common';

import { FormsModule } from '@angular/forms'; 
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private cdr: ChangeDetectorRef,
              private zone: NgZone,
              private notifService: NotificacionService) {
    
  if (isPlatformBrowser(this.platformId)) {
    this.cargarNotificaciones();
    this.nuevaNotificacion();
  }

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

  submenuOpen: string | null = null;

  toggleSubmenu(menu: string) {
  this.submenuOpen = this.submenuOpen === menu ? null : menu;
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
