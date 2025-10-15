import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sugerencia } from '../../models/sugerencia.model';
import { SugerenciasService } from '../../services/sugerencias.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class InicioComponent {
  sugerencia: Sugerencia = { mensaje: '' };
  mensajeExito = '';
  mostrarBuzon = false;

  constructor(private sugerenciasService: SugerenciasService) {}

  toggleBuzon() {
    this.mostrarBuzon = !this.mostrarBuzon;
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
