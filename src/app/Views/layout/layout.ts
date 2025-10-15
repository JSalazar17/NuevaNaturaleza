import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // necesario para ngModel
import { NotificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../models/notificacion';
import { Usuario } from '../../models/usuario.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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
  usuario: Usuario | null = null;
  mostrarPanel = false;
  hayNotificacionNueva = false;
  rol: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private notifService: NotificacionService,
    private authService: AuthService, // 👈 agregado
    private router: Router,
  ) {
    this.cargarNotificaciones();
    this.nuevaNotificacion();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
      this.rol = this.usuario?.idRol || null;
    }
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

  logout() {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
      this.authService.logout(); // elimina token/cookies en backend
      localStorage.removeItem('usuario');
      this.router.navigate(['/login']);
    }
  }
}