import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { Rol } from '../../models/rol.model';
import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
  imports: [FormsModule,CommonModule]
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  usuarioForm: Usuario = { idUsuario: '',idRol: '', cedula: '', nombre: '', correo: '', clave: '' };
  usuarioEditando = false;

  constructor(private usuarioService: UsuarioService, private rolService: RolService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(data => this.usuarios = data);
  }

  cargarRoles() {
    this.rolService.getRoles().subscribe(data => this.roles = data);
  }

  getRolNombre(id: string): string {
  const rol = this.roles.find(r => r.idRol === id);
  return rol ? rol.nombre : 'Sin Rol';
}

  guardarUsuario() {
    if (this.usuarioEditando) {
      this.usuarioService.updateUsuario(this.usuarioForm.idUsuario!, this.usuarioForm)
        .subscribe(() => {
          this.cargarUsuarios();
          this.resetForm();
        });
    } else {
      this.usuarioService.createUsuario(this.usuarioForm)
        .subscribe(() => {
          this.cargarUsuarios();
          this.resetForm();
        });
    }
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioForm = { ...usuario };
    this.usuarioEditando = true;
  }

  eliminarUsuario(id: string) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usuarioService.deleteUsuario(id).subscribe(() => this.cargarUsuarios());
    }
  }

  resetForm() {
    this.usuarioForm = { idUsuario: '', idRol: '', cedula: '', nombre: '', correo: '', clave: '' };
    this.usuarioEditando = false;
  }
}
