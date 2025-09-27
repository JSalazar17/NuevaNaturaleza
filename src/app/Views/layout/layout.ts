import { ChangeDetectorRef, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NotificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../models/notificacion';
import { BehaviorSubject, delay } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent {


  private notificacionSubject = new BehaviorSubject<Notificacion[]>([]);
  notificacionaes$ = this.notificacionSubject.asObservable();
  isCollapsed = false;
  mostrarPanel = false;
  hayNotificacionNueva = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,private cdr: ChangeDetectorRef,private zone: NgZone,private notifService: NotificacionService) {
    
  if (isPlatformBrowser(this.platformId)) {
    this.cargarNotificaciones();
    this.nuevaNotificacion();
  }

  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  cargarNotificaciones() {
    this.notifService.getNotificaciones().subscribe(data => {
      this.notificacionSubject.next(data)
      
   //this.nuevaNotificacion1()
    })

    let x = {
      idTitulo: '5a13f651-308c-4597-be1d-0c8cafa88528',
      idTipoNotificacion: 'ee1b50d9-91c3-4097-b787-5fd110eb6293',
      mensaje: 'Variable critica sin medir',
      enlace: 'lol'
    } as Notificacion
   // this.notifService.addNotificacion(x).subscribe((data) => { console.log(data) })
  }

  nuevaNotificacion() {
    this.notifService.iniciarConexion();
    this.notifService.hubNotifications().on('RecibirNotificacion', (data) => {
      console.log(data)
      console.log('Notificación recibida:', data as Notificacion);
      let notiTemp = this.notificacionSubject.getValue();
      notiTemp.push(data)
      this.notificacionSubject.next([...notiTemp])

          this.zone.run(() => {
      this.nuevaNotificacion1();
    this.cdr.detectChanges(); 
    });
    this.cdr.detectChanges(); 
      return data;
    });
  }
  nuevaNotificacion1() {
  this.hayNotificacionNueva = true;

  // Si quieres que el parpadeo sea finito y luego se quite
  setTimeout(() => {
    this.hayNotificacionNueva = false;
  }, 1000); // después de 3s se apaga el parpadeo
}
}
