import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { Rol } from '../../models/rol.model';
import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../ConfirmDialog/confirmDialog';
import { MatDialog } from '@angular/material/dialog';
import { CRUsuariosComponent } from './crusuarios/crusuarios';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
  imports: [FormsModule,CommonModule]
})
export class UsuariosComponent implements OnInit {
  private usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  usuarios$: Observable<Usuario[]>=this.usuariosSubject.asObservable();
  private rolesSubject = new BehaviorSubject<Rol[]>([]);
  roles$: Observable<Rol[]>=this.rolesSubject.asObservable();
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  usuarioForm: Usuario = { idUsuario: '',idRol: '', cedula: '', nombre: '', correo: '', clave: '' };
  usuario:Usuario
  usuarioEditando = false;

  constructor(private usuarioService: UsuarioService, 
    private dialog: MatDialog,
    private rolService: RolService) {
    
    this.cargarUsuarios();
    this.cargarRoles();
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(data => {this.usuarios = data
      this.usuariosSubject.next(data)
    });
  }

  cargarRoles() {
    this.rolService.getRoles().subscribe(data => {
      this.roles = data
      this.rolesSubject.next(data)
    });
  }

  getRolNombre(id: string): string {
  const rol = this.roles.find(r => r.idRol === id);
  return rol ? rol.nombre : 'Sin Rol';
}

  guardarUsuario() {
    
    this.usuarioForm=this.usuario
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
    const dialogRef = this.dialog.open(CRUsuariosComponent, {
          width: '800px',
          data: { roles:this.roles ,usuario:usuario}   // 👈 enviamos el modelo
        });
    
        dialogRef.afterClosed().subscribe(result => {
          console.log(result)
        });
  }

  eliminarUsuario(id: string) {
    
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '800px',
          data: { message:'¿Seguro que deseas eliminar este usuario?' }   // 👈 enviamos el modelo
        });
    
        dialogRef.afterClosed().subscribe(result => {
          console.log(result)
          if (result) {
            // Si se guardó correctamente, refrescamos la lista
            this.usuarioService.deleteUsuario(id).subscribe(() => this.cargarUsuarios());
          }
        });
  }

  resetForm() {
    this.usuarioForm = { idUsuario: '', idRol: '', cedula: '', nombre: '', correo: '', clave: '' };
    this.usuarioEditando = false;
  }
}
