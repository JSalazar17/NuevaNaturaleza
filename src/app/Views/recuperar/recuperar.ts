import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RecuperarRequest } from '../../models/recuperar.model';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperar.html',
  styleUrls: ['./recuperar.css']
})
export class RecuperarComponent {
  correo: string = '';
  success: string = '';
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  recuperar(): void {
    if (!this.correo) {
      this.error = 'Debe ingresar un correo válido';
      this.success = '';
      return;
    }

    let payload: RecuperarRequest = {
      user: this.correo,
      url: `${window.location.origin}/cambiar-contraseña`
    };

    this.authService.requestPassword(payload).subscribe({
      next: data => {
        console.log(data)
        if (data.numberResponse == 0) {
          this.success = 'Se ha enviado un enlace de recuperación a su correo';
          this.error = '';
          this.correo = '';
          this.cd.detectChanges(); // fuerza actualización de la vista
        setTimeout(() => this.volverLogin(), 5000);
        } else {
          this.error = 'No se pudo procesar la solicitud, correo inválido';
          this.success = '';
          this.cd.detectChanges();
        }
      },
      error: () => {
        this.error = 'No se pudo procesar la solicitud, correo inválido';
        this.success = '';
        this.cd.detectChanges();
      }
    });
  }

  volverLogin(): void {
    this.router.navigate(['/login']);
  }
}
