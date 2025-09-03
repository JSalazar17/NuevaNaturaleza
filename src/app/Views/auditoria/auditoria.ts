import { Component, OnInit } from '@angular/core';
import { Auditoria } from '../../models/auditoria.model';
import { Usuario } from '../../models/usuario.model';
import { AuditoriaService } from '../../services/auditoria.service';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InicioComponent } from "../inicio/inicio";
import { RouterLink, RouterOutlet } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.html',
  imports: [RouterOutlet, RouterLink, CommonModule, DatePipe, FormsModule, InicioComponent],
  styleUrls: ['./auditoria.css']
})
export class AuditoriaComponent implements OnInit {
  auditorias$ = new BehaviorSubject<Auditoria[]>([]);
  auditoriaSeleccionada?: Auditoria;
  usuarioInfo?: Usuario;
  mostrarModal = false;

  constructor(
    private auditoriaService: AuditoriaService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarAuditorias();
  }

  cargarAuditorias(): void {
    this.auditoriaService.getAuditorias().subscribe((data: Auditoria[]) => {
      this.auditorias$.next(data);
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
