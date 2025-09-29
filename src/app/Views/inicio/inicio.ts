import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // 🔹 Necesario para *ngIf, *ngFor
import { Sugerencia } from '../../models/sugerencia.model';
import { SugerenciasService } from '../../services/sugerencias.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule], // 🔹 Aquí se agrega CommonModule
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class InicioComponent {
  isCollapsed: boolean = false;
  sugerencia: Sugerencia = { mensaje: '' };
  mensajeExito = '';

  constructor(private sugerenciasService: SugerenciasService) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  enviarSugerencia() {
  if (!this.sugerencia.mensaje.trim()) return;
  this.sugerenciasService.agregarSugerencia(this.sugerencia).subscribe(() => {
    this.mensajeExito = '¡Gracias por tu sugerencia!';
    this.sugerencia = { mensaje: '' };
    setTimeout(() => this.mensajeExito = '', 3000);
  });
}

}
