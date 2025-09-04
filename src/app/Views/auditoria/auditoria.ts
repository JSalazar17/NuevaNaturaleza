import { Component, OnInit } from '@angular/core';
import { Auditoria } from '../../models/auditoria.model';
import { Usuario } from '../../models/usuario.model';
import { AuditoriaService } from '../../services/auditoria.service';
import { UsuarioService } from '../../services/usuario.service';
import { AccionService } from '../../services/accion.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InicioComponent } from "../inicio/inicio";
import { BehaviorSubject, Observable } from 'rxjs';
import { Dispositivo } from '../../models/dispositivo.model';
import { Accion } from '../../models/accion.model';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.html',
  imports: [CommonModule, DatePipe, FormsModule, InicioComponent],
  styleUrls: ['./auditoria.css']
})
export class AuditoriaComponent implements OnInit {

  private auditoriasSubject = new BehaviorSubject<Auditoria[]>([]);
  auditorias$: Observable<Auditoria[]>=this.auditoriasSubject.asObservable();
  private usuarioSubject = new BehaviorSubject<Usuario[]>([]);
  usuarios$: Observable<Usuario[]>=this.usuarioSubject.asObservable();
  private dispositivoSubject = new BehaviorSubject<Dispositivo[]>([]);
  dispositivos$: Observable<Dispositivo[]>=this.dispositivoSubject.asObservable();
  private accionSubject = new BehaviorSubject<Accion[]>([]);
  acciones$: Observable<Accion[]>=this.accionSubject.asObservable();

  auditoriaSeleccionada?: Auditoria;
  usuarioInfo?: Usuario;
  mostrarModal = false;

  constructor(
    private auditoriaService: AuditoriaService,
    private usuarioService: UsuarioService,
    private dispositivoService : DispositivoService,
    private accionService : AccionService,
  ) {
     this.auditoriasSubject.subscribe((data) => {
      this.cargarAcciones();
      this.cargarUsuarios();
      this.cargarDispositivos();
    });}

  ngOnInit(): void {
    this.cargarAuditorias();
  }

  cargarAuditorias(): void {
  this.auditoriaService.getAuditorias().subscribe((data: Auditoria[]) => {
    this.auditoriasSubject.next(data);console.log(data)
  });
}

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe((usuarios) => {
      const auditorias = this.auditoriasSubject.getValue();
      auditorias.forEach(a => {
        const usuario = usuarios.find(u => u.idUsuario === a.idUsuario);
        a.usuarioNombre = usuario ? usuario.nombre : 'Desconocido';
      });
      this.auditoriasSubject.next([...auditorias]); // refresca la tabla
    });
  }

  cargarDispositivos(): void {
    this.dispositivoService.getDispositivos().subscribe((dispositivos) => {
      const auditorias = this.auditoriasSubject.getValue();
      auditorias.forEach(a => {
        const disp = dispositivos.find(d => d.idDispositivo === a.idDispositivo);
        a.dispositivoNombre = disp ? disp.nombre : 'Sin dispositivo';
      });
      this.auditoriasSubject.next([...auditorias]);
    });
  }

  cargarAcciones(): void {
    this.accionService.getAcciones().subscribe((acciones) => {
      const auditorias = this.auditoriasSubject.getValue();
      auditorias.forEach(a => {
        const acc = acciones.find(ac => ac.idAccionAct === a.idAccionAct);
        a.accionNombre = acc ? acc.accion : 'N/A';
      });
      this.auditoriasSubject.next([...auditorias]);
    });
  }

  seleccionarAuditoria(auditoria: Auditoria): void {
    this.auditoriaSeleccionada = auditoria;

    if (auditoria.idUsuario) {
      this.usuarioService.getUsuarioPorId(auditoria.idUsuario).subscribe((usuario: Usuario) => {
        this.usuarioInfo = usuario;
        this.mostrarModal = true;
      });
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioInfo = undefined;
  }
}
