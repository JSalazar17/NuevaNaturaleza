import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css'
})
export class Recuperar {
  correo = '';

  enviarRecuperacion() {
    console.log('Solicitar recuperación para:', this.correo);
    // Aquí luego llamas al servicio real
  }
}

