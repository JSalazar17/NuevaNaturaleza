import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { Rol } from '../../models/rol.model';
import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';   // ✅ importamos Router

@Component({
  selector: 'app-registrar-usuario',
  templateUrl: './registrar-usuario.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./registrar-usuario.css']
})
export class RegistrarUsuario {
  usuario: Usuario = {
    idUsuario: '',
    cedula: '',
    nombre: '',
    correo: '',
    clave: '',
    idRol: '' 
  };

  roles: Rol[] = [];
  mensaje: string = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private router: Router   // ✅ inyectamos Router
  ) {}

  ngOnInit() {
    
  if (isPlatformBrowser(this.platformId)) {
    this.cargarRoles();}
  }

  cargarRoles() {
    this.rolService.getRoles().subscribe({
      next: (res) => (this.roles = res),
      error: (err) => console.error('Error al cargar roles', err)
    });
  }

  registrar() {
    this.usuarioService.createUsuario(this.usuario).subscribe({
      next: () => {
        // ✅ Redirección inmediata al login después de registrar
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.mensaje = 'Error al registrar usuario ❌';
      }
    });
  }
}
