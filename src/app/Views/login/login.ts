import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginModel } from '../../models/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginController {
  user = signal<LoginModel>({ User: '', Pass: '' });
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  constructor(private authService: AuthService) {}

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  iniciarSesion() {
    const loginData = this.user();
    if (!loginData.User || !loginData.Pass) {
      this.errorMessage.set('Por favor, complete todos los campos.');
      return;
    }

    this.authService.login(loginData).subscribe({
      next: response => {
        console.log('Login exitoso:', response);
        // Redireccionar o guardar token si es necesario
        this.errorMessage.set('');
      },
      error: err => {
        console.error('Error de login:', err);
        this.errorMessage.set('Usuario o contraseña incorrectos.');
      }
    });
  }
}
