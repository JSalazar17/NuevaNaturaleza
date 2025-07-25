import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  usuario = '';
  contrasena = '';
  mostrarContrasena = false;
console: any;

  ingresar() {
    console.log('Ingresar con:', this.usuario, this.contrasena);
    // Aquí luego agregas la validación real
  }
}
