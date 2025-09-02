import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CambiarContrasenaRequest } from '../../models/cambiarcontraseña.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cambiar-contraseña',
  templateUrl: './cambiar-contraseña.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./cambiar-contraseña.css']
})
export class CambiarContrasena implements OnInit {
  nueva: string = '';
  confirmar: string = '';
  token: string = '';
  error: string = '';
  success: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    // Captura el token de la URL ?id=xxxxx
    this.token = this.route.snapshot.queryParamMap.get('id') || '';
  }

  cambiarPassword() {
    this.error = '';
    this.success = '';

    if (this.nueva !== this.confirmar) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    const payload: CambiarContrasenaRequest = {
      pass: this.nueva,
      repass: this.confirmar,
      token: this.token
    };

    this.authService.recoverPassword(payload).subscribe({
      next: (data) => {
        console.log(data)
        this.success = 'Contraseña cambiada correctamente',
        this.cd.detectChanges();
        setTimeout(() => this.volverLogin(), 5000);
      },
      error: () => {
        this.error = 'Error al cambiar la contraseña',
        this.cd.detectChanges();
      }
    });
  }

  volverLogin(): void {
    this.router.navigate(['/login']);
  }
}
