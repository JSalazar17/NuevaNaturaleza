import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginModel } from '../../models/login.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'] // 👈 corregido (era styleUrl)
})
export class LoginController {
  user = signal<LoginModel>({ User: '', Pass: '' });
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  iniciarSesion() {
    console.log(this.user())
    const loginData = this.user();

    if (!loginData.User || !loginData.Pass) {
      this.errorMessage.set('Por favor, complete todos los campos.');
      return;
    }

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        console.log(response.data);
        console.log(response.numberResponse);
        console.log(response.numberResponse === 0);

        if (response.data && response.numberResponse === 0) {
          // ✅ Guardar datos de usuario en localStorage
          this.authService.saveUserSession(response.data);

          // ✅ Redirigir según el rol
          const rol = response.data.rol;
          console.log(rol)
          if (rol === 'Administrador') {
            this.router.navigate(['/actuadores']);
          } else if (rol === 'Operario') {
            this.router.navigate(['/actuadores']);
          } else {
            this.router.navigate(['/login']);
          }

          this.errorMessage.set('');
        } else {
          this.errorMessage.set(response.message || 'Credenciales incorrectas.');
        }
      },
      error: (err) => {
        console.error('Error de login:', err);
        this.errorMessage.set('Error al conectar con el servidor.');
      }
    });
  }
}
