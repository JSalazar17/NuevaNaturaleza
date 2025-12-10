import { ChangeDetectorRef, Component, inject, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // necesario para ngModel
import { NotificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../models/notificacion';
import { Usuario } from '../../models/usuario.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Sugerencia } from '../../models/sugerencia.model';
import { SugerenciasService } from '../../services/sugerencias.service';
import { MatIconModule } from '@angular/material/icon';
import { SignalRService } from '../../services/signalr.service';
import { MatDialog } from '@angular/material/dialog';
import { ToggleService } from '../../services/toggle.service';
import { ConfirmDialogComponent } from '../ConfirmDialog/confirmDialog';
import { CRUsuariosComponent } from '../usuarios/crusuarios/crusuarios';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule, MatIconModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  private notificacionSubject = new BehaviorSubject<Notificacion[]>([]);
  notificacionaes$ = this.notificacionSubject.asObservable();
  isCollapsed = false;
  usuario: Usuario | null = null;
  mostrarPanel = false;
  hayNotificacionNueva = false;
  rol: string | null = null;
  isAdmin = signal<boolean>(false);
  notificaciones: Notificacion[] = [];
  mostrarNotis = false;
  mostrarPerfil = false;
  private sub!: Subscription;

  constructor(
    private sugerenciasService: SugerenciasService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private notifService: NotificacionService,
    private authService: AuthService,
    private router: Router,
    private signalRService: SignalRService,
    private matDialog: MatDialog,
    private toggleSvc: ToggleService
  ) {
    this.cargarNotificaciones();
    this.nuevaNotificacion();
    const usuarioGuardado = this.authService.getFullUser();
    console.log("this.authService.getUserRole()")
    console.log(this.authService.getUserRole())
    this.rol = this.authService.getUserRole()
    this.isAdmin.set(this.rol?.toString() === "Administrador")
    console.log(this.isAdmin())
    if (usuarioGuardado) {
      this.usuario = (usuarioGuardado);
    }
  }

  toggleSidebar(turste:boolean=!this.isCollapsed) {
    this.isCollapsed = turste;
  }

  ngOnInit() {

    const content = document.getElementsByClassName('content')

    if (this.signalRService)
      this.signalRService.iniciarConexion();


    this.toggleSidebar(true)

  }

  ngOnDestroy(): void {
    this.signalRService.detenerConexion();
  }

  submenuOpen: string | null = null;

  toggleSubmenu(menu: string) {
    this.submenuOpen = this.submenuOpen === menu ? null : menu;
  }

  togglePerfil() {
    this.mostrarPerfil = !this.mostrarPerfil;
  }

  abrirEditarUsuario() {
  if (!this.usuario) return;

  const dialogRef = this.matDialog.open(CRUsuariosComponent, {
    width: "600px",
    data: { usuario: this.usuario, roles: this.rol } // roles necesarios 👉
  });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.toggleSvc.show('Perfil actualizado');
        this.usuario = this.authService.getFullUser();
      }
    });
  } 


  /*cargarNotificaciones() {
    this.notifService.getNotificaciones().subscribe(data => {
      this.notificacionSubject.next(data);
    });
  }*/

  //nuevaNotificacion() {
    // this.notifService.iniciarConexion();

    /*this.sub = this.signalRService.eventoGeneral$.subscribe(data => {
      if (!data) return;
      
      // Identifica el tipo de evento recibido
      console.log(data)
    });*/
    /*this.notifService.hubNotifications().on('RecibirNotificacion', (data) => {
      let notiTemp = this.notificacionSubject.getValue();
      notiTemp.push(data);
      this.notificacionSubject.next([...notiTemp]);
      this.zone.run(() => {
        this.nuevaNotificacion1();
        this.cdr.detectChanges();
      });
    });*/
  //}

  nuevaNotificacion() {
    this.hayNotificacionNueva = true;
    setTimeout(() => {
      this.hayNotificacionNueva = false;
    }, 1000);
  }

  toggleNotificaciones(){
  this.mostrarNotis = !this.mostrarNotis;
}

// getter sencillo para contar no-leídas
get noLeidasCount(){
  return (this.notificaciones || []).some(n => !n.leido);
}

marcarLeida(noti: Notificacion){
  noti.leido = true;
  this.notifService.marcarComoLeida(noti.idNotificacion as string).subscribe(()=>{});
}

eliminarNoti(noti: Notificacion){
  this.notifService.deleteNotificacion(noti.idNotificacion as string).subscribe(()=>{
    this.notificaciones = this.notificaciones.filter(x=>x.idNotificacion as string !== noti.idNotificacion as string);
  });
}

// Sobrescribe cargarNotificaciones() para guardar en el arreglo
cargarNotificaciones(){
  this.notifService.getNotificaciones().subscribe(data=>{
    this.notificaciones = data;
  });
}

// Aquí puedes activar cuando recibas por SignalR
nuevaNotificacion1(){
  this.hayNotificacionNueva = true;
  setTimeout(()=> this.hayNotificacionNueva=false,1000);
}


  logout() {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '800px', data: { message: '' } // 👈 enviamos el modelo
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result) {
        this.toggleSvc.show('Sesión cerrada exitosamente')
        this.authService.logout();

      }
    })

  }
  sugerencia: Sugerencia = { mensaje: '' };
  mensajeExito = '';
  mostrarBuzon = false;

  toggleBuzon() {
    this.mostrarBuzon = !this.mostrarBuzon;
    console.log("motrarbuxo");
    console.log(this.mostrarBuzon)
  }

  enviarSugerencia() {
    if (!this.sugerencia.mensaje.trim()) {
      
      this.toggleSvc.show('Digite todos los campos antes de continuar', 'warning')
      return;}
    this.sugerenciasService.agregarSugerencia(this.sugerencia).subscribe(() => {
      
      this.toggleSvc.show('¡Gracias por tu sugerencia!')
      this.sugerencia = { mensaje: '' };
      
    });
    this.toggleBuzon();
  }

}